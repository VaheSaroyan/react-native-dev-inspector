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
  /**
   * Whether to run at all.
   *
   * Defaults to false when Babel's env is "production", so source paths are
   * not shipped in release bundles. Set it explicitly to override.
   */
  enabled?: boolean;
}

interface PluginState {
  filename?: string;
  cwd: string;
  opts: BabelPluginOptions;
  /** Components whose root native element already forwards __callerSource */
  injectedCallerSourceForwarding?: Set<string>;
  /** Component functions that already have a usable __callerSource binding */
  injectedCallerSourceParam?: Set<string>;
}

/** Name of the prop/binding used to carry the call-site of a user component. */
const CALLER_SOURCE = '__callerSource';

/** Prop that always carries the definition site of an element. */
const DATA_SOURCE = 'dataInspectorSource';

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

type ComponentFunction =
  | t.FunctionDeclaration
  | t.ArrowFunctionExpression
  | t.FunctionExpression;

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

function looksLikeComponentName(name: string | null | undefined): boolean {
  return !!name && name[0] === name[0].toUpperCase();
}

/** Wrappers whose argument is still the component function. */
const COMPONENT_WRAPPERS = new Set(['forwardRef', 'memo', 'React.forwardRef', 'React.memo']);

function getCalleeName(
  callee: t.Node,
  t: typeof import('@babel/core').types
): string | null {
  if (t.isIdentifier(callee)) return callee.name;
  if (t.isMemberExpression(callee) && t.isIdentifier(callee.object) && t.isIdentifier(callee.property)) {
    return `${callee.object.name}.${callee.property.name}`;
  }
  return null;
}

/**
 * Resolve the name a function expression is ultimately bound to, seeing through
 * `forwardRef(...)` / `memo(...)` wrappers:
 *
 *   const CustomButton = forwardRef((props, ref) => ...)
 *   const Card = memo(forwardRef(function Card() { ... }))
 */
function getBoundComponentName(
  funcPath: NodePath,
  t: typeof import('@babel/core').types
): string | null {
  let current: NodePath | null = funcPath.parentPath;

  // Climb out of any number of recognised wrapper calls.
  while (current && current.isCallExpression()) {
    const calleeName = getCalleeName((current.node as t.CallExpression).callee, t);
    if (!calleeName || !COMPONENT_WRAPPERS.has(calleeName)) return null;
    current = current.parentPath;
  }

  if (current && current.isVariableDeclarator()) {
    const id = (current.node as t.VariableDeclarator).id;
    if (t.isIdentifier(id) && looksLikeComponentName(id.name)) {
      return id.name;
    }
  }

  return null;
}

/**
 * Find the function component that contains a JSX element.
 * Returns both its path and its name, or null when the JSX is not inside
 * something that looks like a component.
 */
function getContainingComponent(
  nodePath: NodePath<t.JSXOpeningElement>,
  t: typeof import('@babel/core').types
): { path: NodePath<ComponentFunction>; name: string } | null {
  let current: NodePath | null = nodePath.parentPath;

  while (current) {
    if (current.isFunctionDeclaration()) {
      const id = (current.node as t.FunctionDeclaration).id;
      if (id && t.isIdentifier(id) && looksLikeComponentName(id.name)) {
        return { path: current as NodePath<t.FunctionDeclaration>, name: id.name };
      }
    }

    if (current.isArrowFunctionExpression() || current.isFunctionExpression()) {
      // Handles `const C = () => ...` as well as
      // `const C = forwardRef(...)` / `memo(...)` wrappers.
      const name = getBoundComponentName(current, t);
      if (name) {
        return {
          path: current as NodePath<t.ArrowFunctionExpression | t.FunctionExpression>,
          name,
        };
      }
    }

    current = current.parentPath;
  }

  return null;
}

/**
 * Make sure `__callerSource` is a real, in-scope binding inside `funcPath`,
 * reading it from the component's props.
 *
 * Returns true only when a binding is guaranteed to exist. Callers must not
 * emit a reference to `__callerSource` when this returns false, otherwise the
 * generated code throws a ReferenceError at runtime.
 */
function bindCallerSource(
  funcPath: NodePath<ComponentFunction>,
  t: typeof import('@babel/core').types
): boolean {
  const node = funcPath.node;

  // Already bound by a previous pass (or written by hand).
  if (funcPath.scope.hasOwnBinding(CALLER_SOURCE)) return true;

  const declareFromProps = (propsName: string): boolean => {
    const decl = t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(CALLER_SOURCE),
        t.memberExpression(t.identifier(propsName), t.identifier(CALLER_SOURCE))
      ),
    ]);

    if (t.isBlockStatement(node.body)) {
      node.body.body.unshift(decl);
      return true;
    }

    // Concise arrow body: `(props) => <View />`. Expand it into a block so we
    // have somewhere to put the declaration.
    if (t.isExpression(node.body)) {
      node.body = t.blockStatement([decl, t.returnStatement(node.body)]);
      return true;
    }

    return false;
  };

  const addToObjectPattern = (pattern: t.ObjectPattern): boolean => {
    const already = pattern.properties.some(
      (prop) => t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === CALLER_SOURCE
    );
    if (already) return true;

    const prop = t.objectProperty(
      t.identifier(CALLER_SOURCE),
      t.identifier(CALLER_SOURCE),
      false,
      true // shorthand
    );

    // A RestElement must stay last, so insert before it rather than pushing.
    const restIndex = pattern.properties.findIndex((p) => t.isRestElement(p));
    if (restIndex === -1) {
      pattern.properties.push(prop);
    } else {
      pattern.properties.splice(restIndex, 0, prop);
    }
    return true;
  };

  if (node.params.length === 0) {
    node.params.push(t.objectPattern([
      t.objectProperty(t.identifier(CALLER_SOURCE), t.identifier(CALLER_SOURCE), false, true),
    ]));
    funcPath.scope.crawl();
    return true;
  }

  // `({ a } = {})` / `(props = {})` — operate on the pattern being defaulted.
  let firstParam: t.Node = node.params[0];
  if (t.isAssignmentPattern(firstParam)) {
    firstParam = firstParam.left;
  }

  let ok = false;
  if (t.isObjectPattern(firstParam)) {
    ok = addToObjectPattern(firstParam);
  } else if (t.isIdentifier(firstParam)) {
    ok = declareFromProps(firstParam.name);
  }
  // Array patterns and other exotic shapes are not components; leave them be.

  if (ok) funcPath.scope.crawl();
  return ok;
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
 * Additionally, for the root native component inside a user component, we forward
 * the __callerSource prop from the parent component to the native element's testID.
 */
export default function reactNativeDevInspectorPlugin(
  api: { types: typeof import('@babel/core').types; env?: (name?: string) => any }
): PluginObj<PluginState> {
  const { types: t } = api;

  /**
   * Source locations are a development aid. Injecting them into a release
   * bundle ships your file paths to users and bloats every element, so the
   * plugin is off in production unless `enabled: true` is passed explicitly.
   */
  // api.env() may only be called while the plugin is being initialised, so
  // resolve it here rather than lazily inside the visitor.
  let envIsProduction: boolean;
  try {
    envIsProduction =
      typeof api.env === 'function'
        ? api.env('production') === true
        : (process.env.BABEL_ENV || process.env.NODE_ENV) === 'production';
  } catch {
    envIsProduction = (process.env.BABEL_ENV || process.env.NODE_ENV) === 'production';
  }

  const isEnabled = (opts: BabelPluginOptions): boolean =>
    typeof opts.enabled === 'boolean' ? opts.enabled : !envIsProduction;

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

        // Never inject into production bundles unless explicitly asked.
        if (!isEnabled(opts)) return;

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

        const hasAttribute = (name: string): boolean =>
          existingAttrs.some(
            (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === name
          );

        // For user components (like CustomButton, ProfileCard), inject __callerSource
        // This tells the inspector WHERE this component was called from
        if (isUserComponent(componentName) && !hasAttribute(CALLER_SOURCE)) {
          nodePath.node.attributes.push(
            t.jsxAttribute(t.jsxIdentifier(CALLER_SOURCE), t.stringLiteral(sourceValue))
          );
        }

        // `dataInspectorSource` always records where this element is written.
        // It is independent of testID, so user-defined testIDs stay intact and
        // the inspector always has a reliable fallback.
        if (!hasAttribute(DATA_SOURCE)) {
          nodePath.node.attributes.push(
            t.jsxAttribute(t.jsxIdentifier(DATA_SOURCE), t.stringLiteral(sourceValue))
          );
        }

        if (!injectTestId || hasAttribute('testID')) return;

        // For the first native element inside a user component, forward the
        // parent's call site so tapping it reports where the component is USED.
        if (isNativeComponent(componentName)) {
          const containing = getContainingComponent(nodePath, t);

          if (containing && state.injectedCallerSourceForwarding) {
            const componentKey = `${filename}:${containing.name}`;

            if (!state.injectedCallerSourceForwarding.has(componentKey)) {
              // Only forward if we can guarantee __callerSource is in scope.
              // Otherwise the emitted reference would throw a ReferenceError.
              const bound =
                state.injectedCallerSourceParam!.has(componentKey) ||
                bindCallerSource(containing.path, t);

              if (bound) {
                state.injectedCallerSourceForwarding.add(componentKey);
                state.injectedCallerSourceParam!.add(componentKey);

                nodePath.node.attributes.push(
                  t.jsxAttribute(
                    t.jsxIdentifier('testID'),
                    t.jsxExpressionContainer(
                      t.logicalExpression(
                        '||',
                        t.identifier(CALLER_SOURCE),
                        t.stringLiteral(sourceValue)
                      )
                    )
                  )
                );
                return;
              }
            }
          }
        }

        // Everything else gets a plain static testID.
        nodePath.node.attributes.push(
          t.jsxAttribute(t.jsxIdentifier('testID'), t.stringLiteral(sourceValue))
        );
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
