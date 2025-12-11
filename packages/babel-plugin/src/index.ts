import type { PluginObj, NodePath, types as t } from '@babel/core';
import * as path from 'path';

export interface BabelPluginOptions {
  /** Custom working directory, defaults to process.cwd() */
  cwd?: string;
  /** File patterns to exclude from processing */
  excludes?: (string | RegExp)[];
  /**
   * Whether to inject testID with source info (default: true)
   * When true, testID will be set to "ComponentName@file:line:column" format
   * Set to false if you want to preserve testID for automation testing
   */
  injectTestId?: boolean;
}

interface PluginState {
  filename?: string;
  cwd: string;
  opts: BabelPluginOptions;
  /** Track if we've already injected __callerSource forwarding in current component */
  injectedCallerSourceForwarding?: Set<string>;
  /** Track which component functions have had __callerSource added to their params */
  injectedCallerSourceParam?: Set<string>;
}

const DEFAULT_EXCLUDES = [
  /node_modules/,
  /\.expo/,
  /\.next/,
];

// Components that don't accept custom props (React internals, Fragments, etc.)
const SKIP_COMPONENTS = new Set([
  'Fragment',
  'React.Fragment',
  'Suspense',
  'React.Suspense',
  'StrictMode',
  'React.StrictMode',
  'Profiler',
  'React.Profiler',
]);

// Native components that render actual views (these receive the inspector data)
const NATIVE_COMPONENTS = new Set([
  'View',
  'Text',
  'TouchableOpacity',
  'TouchableHighlight',
  'TouchableWithoutFeedback',
  'TouchableNativeFeedback',
  'Pressable',
  'ScrollView',
  'FlatList',
  'SectionList',
  'Image',
  'ImageBackground',
  'TextInput',
  'SafeAreaView',
  'KeyboardAvoidingView',
  'Modal',
  'ActivityIndicator',
  'Button',
  'Switch',
]);

// Check if a name is a user component (starts with uppercase, not native)
function isUserComponent(name: string): boolean {
  if (!name) return false;
  const firstChar = name.charAt(0);
  return firstChar === firstChar.toUpperCase() && !NATIVE_COMPONENTS.has(name) && !SKIP_COMPONENTS.has(name);
}

// Check if a name is a native component
function isNativeComponent(name: string): boolean {
  return NATIVE_COMPONENTS.has(name);
}

/**
 * Check if the given path is inside a function component that could receive __callerSource
 * Returns the function name if found, null otherwise
 */
function getContainingComponentName(
  nodePath: NodePath<t.JSXOpeningElement>,
  t: typeof import('@babel/core').types
): string | null {
  let current: NodePath | null = nodePath.parentPath;

  while (current) {
    // Check for function declaration: function MyComponent() { ... }
    if (current.isFunctionDeclaration()) {
      const id = (current.node as t.FunctionDeclaration).id;
      if (id && t.isIdentifier(id)) {
        const name = id.name;
        // Check if it looks like a component (starts with uppercase)
        if (name && name[0] === name[0].toUpperCase()) {
          return name;
        }
      }
    }

    // Check for arrow function in variable declaration: const MyComponent = () => { ... }
    if (current.isArrowFunctionExpression() || current.isFunctionExpression()) {
      const parent = current.parentPath;
      if (parent && parent.isVariableDeclarator()) {
        const id = (parent.node as t.VariableDeclarator).id;
        if (t.isIdentifier(id)) {
          const name = id.name;
          if (name && name[0] === name[0].toUpperCase()) {
            return name;
          }
        }
      }
    }

    current = current.parentPath;
  }

  return null;
}

/**
 * Find the function component that contains a JSX element and return its path
 */
function getContainingFunctionPath(
  nodePath: NodePath<t.JSXOpeningElement>,
  t: typeof import('@babel/core').types
): NodePath<t.FunctionDeclaration | t.ArrowFunctionExpression | t.FunctionExpression> | null {
  let current: NodePath | null = nodePath.parentPath;

  while (current) {
    if (current.isFunctionDeclaration()) {
      const id = (current.node as t.FunctionDeclaration).id;
      if (id && t.isIdentifier(id)) {
        const name = id.name;
        if (name && name[0] === name[0].toUpperCase()) {
          return current as NodePath<t.FunctionDeclaration>;
        }
      }
    }

    if (current.isArrowFunctionExpression() || current.isFunctionExpression()) {
      const parent = current.parentPath;
      if (parent && parent.isVariableDeclarator()) {
        const id = (parent.node as t.VariableDeclarator).id;
        if (t.isIdentifier(id)) {
          const name = id.name;
          if (name && name[0] === name[0].toUpperCase()) {
            return current as NodePath<t.ArrowFunctionExpression | t.FunctionExpression>;
          }
        }
      }
    }

    current = current.parentPath;
  }

  return null;
}

/**
 * Babel plugin to inject source location information into React Native JSX elements.
 *
 * The format is: ComponentName@file:line:column
 * Example: <CustomButton testID="CustomButton@components/Button.tsx:25:5" />
 *
 * For user components (like CustomButton), we also inject __callerSource which
 * contains the call site location. This allows the inspector to show WHERE
 * a component was used, not just where it was defined.
 *
 * Additionally, for native components inside user components, we inject code to
 * forward the __callerSource prop from the parent component to the native element's testID.
 */
export default function reactNativeDevInspectorPlugin(
  { types: t }: { types: typeof import('@babel/core').types }
): PluginObj<PluginState> {
  return {
    name: '@rn-dev-inspector/babel-plugin',

    visitor: {
      // Track function components and their first native element
      Program: {
        enter(_, state) {
          state.injectedCallerSourceForwarding = new Set();
          state.injectedCallerSourceParam = new Set();
        },
      },

      JSXOpeningElement(nodePath: NodePath<t.JSXOpeningElement>, state: PluginState) {
        const { filename } = state;
        const opts = state.opts || {};
        const cwd = opts.cwd || process.cwd();
        const excludes = [...DEFAULT_EXCLUDES, ...(opts.excludes || [])];
        const injectTestId = opts.injectTestId !== false; // Default true

        // Skip if no filename (e.g., eval'd code)
        if (!filename) return;

        // Check if file should be excluded
        const shouldExclude = excludes.some((pattern) => {
          if (typeof pattern === 'string') {
            return filename.includes(pattern);
          }
          return pattern.test(filename);
        });

        if (shouldExclude) return;

        // Get location info
        const { loc } = nodePath.node;
        if (!loc) return;

        const line = loc.start.line;
        const column = loc.start.column + 1; // 1-indexed for editors

        // Calculate relative path
        const relativePath = path.relative(cwd, filename);

        // Get component name
        const nameNode = nodePath.node.name;
        let componentName: string;

        if (t.isJSXIdentifier(nameNode)) {
          componentName = nameNode.name;
        } else if (t.isJSXMemberExpression(nameNode)) {
          componentName = getJSXMemberExpressionName(nameNode, t);
        } else if (t.isJSXNamespacedName(nameNode)) {
          componentName = `${nameNode.namespace.name}:${nameNode.name.name}`;
        } else {
          componentName = 'Unknown';
        }

        // Skip components that don't accept custom props
        if (SKIP_COMPONENTS.has(componentName)) return;

        // Create source value: ComponentName@file:line:column
        const sourceValue = `${componentName}@${relativePath}:${line}:${column}`;

        const existingAttrs = nodePath.node.attributes;

        // For user components (like CustomButton, ProfileCard), inject __callerSource
        // This tells the inspector WHERE this component was called from
        if (isUserComponent(componentName)) {
          const hasCallerSource = existingAttrs.some((attr) => {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
              return attr.name.name === '__callerSource';
            }
            return false;
          });

          if (!hasCallerSource) {
            const callerAttr = t.jsxAttribute(
              t.jsxIdentifier('__callerSource'),
              t.stringLiteral(sourceValue)
            );
            nodePath.node.attributes.push(callerAttr);
          }
        }

        // For native components inside user components, inject __callerSource forwarding
        // This transforms testID to use props.__callerSource if available
        if (isNativeComponent(componentName)) {
          const containingComponent = getContainingComponentName(nodePath, t);
          const funcPath = getContainingFunctionPath(nodePath, t);

          if (containingComponent && state.injectedCallerSourceForwarding && funcPath) {
            // Check if this is the first native element in this component that we're processing
            // We want to inject forwarding only on the root/first native element
            const componentKey = `${filename}:${containingComponent}`;

            if (!state.injectedCallerSourceForwarding.has(componentKey)) {
              state.injectedCallerSourceForwarding.add(componentKey);

              // Inject __callerSource into the function's parameters if not already done
              const paramKey = `${filename}:${containingComponent}`;
              if (!state.injectedCallerSourceParam!.has(paramKey)) {
                state.injectedCallerSourceParam!.add(paramKey);

                // Get the function's params
                const params = funcPath.node.params;
                if (params.length > 0) {
                  const firstParam = params[0];
                  // If first param is an object pattern (destructuring), add __callerSource to it
                  if (t.isObjectPattern(firstParam)) {
                    const hasCallerSource = firstParam.properties.some((prop) => {
                      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                        return prop.key.name === '__callerSource';
                      }
                      return false;
                    });
                    if (!hasCallerSource) {
                      firstParam.properties.push(
                        t.objectProperty(
                          t.identifier('__callerSource'),
                          t.identifier('__callerSource'),
                          false,
                          true // shorthand
                        )
                      );
                    }
                  }
                  // If first param is an identifier (like 'props'), we need a different approach
                  // Create a variable declaration at the start of the function body
                  else if (t.isIdentifier(firstParam)) {
                    const propsName = firstParam.name;
                    const body = funcPath.node.body;
                    if (t.isBlockStatement(body)) {
                      // Add: const __callerSource = props.__callerSource;
                      const callerSourceDecl = t.variableDeclaration('const', [
                        t.variableDeclarator(
                          t.identifier('__callerSource'),
                          t.memberExpression(
                            t.identifier(propsName),
                            t.identifier('__callerSource')
                          )
                        )
                      ]);
                      body.body.unshift(callerSourceDecl);
                    }
                  }
                } else {
                  // No params at all - add { __callerSource } as the first param
                  params.push(
                    t.objectPattern([
                      t.objectProperty(
                        t.identifier('__callerSource'),
                        t.identifier('__callerSource'),
                        false,
                        true
                      )
                    ])
                  );
                }
              }

              // Check if testID is already set
              const testIdAttrIndex = existingAttrs.findIndex((attr) => {
                if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                  return attr.name.name === 'testID';
                }
                return false;
              });

              if (testIdAttrIndex === -1 && injectTestId) {
                // No testID set, inject: testID={props.__callerSource || "ComponentName@file:line:col"}
                // This creates: testID={__callerSource || "TouchableOpacity@CustomButton.tsx:14:9"}
                const testIdAttr = t.jsxAttribute(
                  t.jsxIdentifier('testID'),
                  t.jsxExpressionContainer(
                    t.logicalExpression(
                      '||',
                      t.identifier('__callerSource'),
                      t.stringLiteral(sourceValue)
                    )
                  )
                );
                nodePath.node.attributes.push(testIdAttr);
              }

              // Skip adding the regular testID since we've added the dynamic one
              return;
            }
          }
        }

        // Always add dataInspectorSource for the inspector
        // This is separate from testID and doesn't interfere with automation
        const hasDataInspectorSource = existingAttrs.some((attr) => {
          if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
            return attr.name.name === 'dataInspectorSource';
          }
          return false;
        });

        if (!hasDataInspectorSource) {
          const dataAttr = t.jsxAttribute(
            t.jsxIdentifier('dataInspectorSource'),
            t.stringLiteral(sourceValue)
          );
          nodePath.node.attributes.push(dataAttr);
        }

        // Optionally inject testID (for backward compatibility and simpler inspection)
        if (injectTestId && !isNativeComponent(componentName)) {
          const hasTestId = existingAttrs.some((attr) => {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
              return attr.name.name === 'testID';
            }
            return false;
          });

          // Only add testID if not already present (preserve user-defined testIDs)
          if (!hasTestId) {
            const testIdAttr = t.jsxAttribute(
              t.jsxIdentifier('testID'),
              t.stringLiteral(sourceValue)
            );
            nodePath.node.attributes.push(testIdAttr);
          }
        }

        // For native components that weren't the first in a user component, add regular testID
        if (injectTestId && isNativeComponent(componentName)) {
          const hasTestId = existingAttrs.some((attr) => {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
              return attr.name.name === 'testID';
            }
            return false;
          });

          if (!hasTestId) {
            const testIdAttr = t.jsxAttribute(
              t.jsxIdentifier('testID'),
              t.stringLiteral(sourceValue)
            );
            nodePath.node.attributes.push(testIdAttr);
          }
        }
      },
    },
  };
}

function getJSXMemberExpressionName(
  node: t.JSXMemberExpression,
  t: typeof import('@babel/core').types
): string {
  const parts: string[] = [];

  let current: t.JSXMemberExpression | t.JSXIdentifier = node;

  while (t.isJSXMemberExpression(current)) {
    parts.unshift(current.property.name);
    current = current.object as t.JSXMemberExpression | t.JSXIdentifier;
  }

  if (t.isJSXIdentifier(current)) {
    parts.unshift(current.name);
  }

  return parts.join('.');
}

// Named export for ESM compatibility
export { reactNativeDevInspectorPlugin };
