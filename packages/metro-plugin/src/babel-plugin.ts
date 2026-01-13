/**
 * Babel plugin that injects source location info into JSX elements
 * This enables the inspector to open the source file in the editor
 */

import type { PluginObj, NodePath, types as t } from '@babel/core';

interface PluginOptions {
  /** Only inject into user components (not native View/Text) */
  userComponentsOnly?: boolean;
}

interface BabelAPI {
  types: typeof t;
}

// Native components that don't need source injection
const NATIVE_COMPONENTS = new Set([
  'View', 'Text', 'Image', 'ScrollView', 'FlatList', 'SectionList',
  'TextInput', 'TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback',
  'Pressable', 'Button', 'Switch', 'ActivityIndicator', 'StatusBar',
  'SafeAreaView', 'KeyboardAvoidingView', 'Modal', 'RefreshControl',
]);

export default function inspectorBabelPlugin(
  api: BabelAPI,
  options: PluginOptions = {}
): PluginObj {
  const { types: t } = api;
  const { userComponentsOnly = false } = options;

  return {
    name: 'react-native-dev-inspector',
    visitor: {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>, state: any) {
        // Skip if no source location
        const { loc } = path.node;
        if (!loc) return;

        // Get the filename
        const filename = state.filename || state.file?.opts?.filename || '';

        // Skip node_modules files - we only want user code
        if (filename.includes('node_modules')) return;

        // Get the component name
        let componentName: string | null = null;
        if (t.isJSXIdentifier(path.node.name)) {
          componentName = path.node.name.name;
        } else if (t.isJSXMemberExpression(path.node.name)) {
          // Handle Animated.View, etc.
          componentName = path.node.name.property.name;
        }

        if (!componentName) return;

        // Skip lowercase elements (html-like: div, span, etc.)
        if (componentName[0] !== componentName[0].toUpperCase()) return;

        // Skip native components if userComponentsOnly is true
        if (userComponentsOnly && NATIVE_COMPONENTS.has(componentName)) return;

        // Check if __callerSource already exists
        const hasCallerSource = path.node.attributes.some(
          attr => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: '__callerSource' })
        );
        if (hasCallerSource) return;

        // Create the source info object (filename already obtained above)
        const sourceInfo = {
          fileName: filename || 'unknown',
          lineNumber: loc.start.line,
          columnNumber: loc.start.column + 1,
        };

        // Add __callerSource attribute
        const sourceAttribute = t.jsxAttribute(
          t.jsxIdentifier('__callerSource'),
          t.jsxExpressionContainer(
            t.objectExpression([
              t.objectProperty(t.identifier('fileName'), t.stringLiteral(sourceInfo.fileName)),
              t.objectProperty(t.identifier('lineNumber'), t.numericLiteral(sourceInfo.lineNumber)),
              t.objectProperty(t.identifier('columnNumber'), t.numericLiteral(sourceInfo.columnNumber)),
            ])
          )
        );

        path.node.attributes.push(sourceAttribute);
      },
    },
  };
}

// CommonJS export for babel
module.exports = inspectorBabelPlugin;
