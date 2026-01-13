---
sidebar_position: 4
---

# Babel Plugin

The optional babel plugin enhances source tracking by injecting precise location information into your JSX elements.

## Why Use the Babel Plugin?

Without the babel plugin, the inspector relies on React's built-in `_debugSource` which sometimes points to where a component is **defined** rather than where it's **used**. The babel plugin injects `__callerSource` props that point to the exact location where each JSX element is written.

**Without babel plugin:**
- Tapping on `<Text>` might show the file where `Text` is defined
- Source location can be less accurate

**With babel plugin:**
- Tapping on `<Text>` shows the exact line in your file where you wrote `<Text>`
- Precise source tracking for all components

## Installation

The babel plugin is included in the metro plugin package:

```bash
npm install @rn-dev-inspector/metro-plugin --save-dev
# or if using the umbrella package:
npm install react-native-dev-inspector
```

## Configuration

Add the plugin to your `babel.config.js`:

```js title="babel.config.js"
const { inspectorBabelPlugin } = require('react-native-dev-inspector/metro');
// or: require('@rn-dev-inspector/metro-plugin')

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      inspectorBabelPlugin,
      // ... other plugins
    ],
  };
};
```

:::tip
After adding the babel plugin, clear the Metro cache: `npx expo start --clear`
:::

## How It Works

The babel plugin transforms your JSX by adding `__callerSource` props:

```tsx
// Your code
<View style={styles.container}>
  <Text>Hello World</Text>
</View>

// After transformation
<View
  style={styles.container}
  __callerSource={{ fileName: "/app/Screen.tsx", lineNumber: 10, columnNumber: 3 }}
>
  <Text __callerSource={{ fileName: "/app/Screen.tsx", lineNumber: 11, columnNumber: 5 }}>
    Hello World
  </Text>
</View>
```

The inspector component reads this `__callerSource` prop to provide accurate "Open in Editor" functionality.

## Options

### `userComponentsOnly`

- **Type**: `boolean`
- **Default**: `false`

When `true`, only injects source info into user-defined components (components starting with uppercase that aren't native React Native components like View, Text, etc.).

```js title="babel.config.js"
plugins: [
  [inspectorBabelPlugin, { userComponentsOnly: true }],
],
```

## What Gets Transformed

The plugin processes:

- All JSX elements in your source files
- Components starting with uppercase letters (e.g., `<View>`, `<MyComponent>`)

The plugin skips:

- Files in `node_modules` (only user code is transformed)
- HTML-like elements (lowercase, e.g., `<div>`, `<span>`)
- Elements that already have `__callerSource` prop

## NativeWind Integration

When using NativeWind, place the inspector plugin before the reanimated plugin:

```js title="babel.config.js"
const { inspectorBabelPlugin } = require('react-native-dev-inspector/metro');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      inspectorBabelPlugin,
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```

## Troubleshooting

### Source Still Not Accurate

1. Make sure you cleared the Metro cache after adding the plugin
2. Verify the plugin is in your `babel.config.js` (not `babel.config.json`)
3. Check that the file isn't in `node_modules`

### Build Errors

If you see babel-related errors:

1. Ensure `@babel/core` is installed (usually comes with Expo/RN)
2. Check for conflicts with other babel plugins
3. Try moving the inspector plugin earlier in the plugins array

### TypeScript Errors

The `__callerSource` prop is internal and shouldn't cause TypeScript errors. If you see them:

1. Update to the latest version of the package
2. The prop is typed as optional and should be ignored by TypeScript
