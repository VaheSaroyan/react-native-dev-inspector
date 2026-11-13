---
sidebar_position: 2
---

# Babel Plugin

The `@rn-dev-inspector/babel-plugin` injects source location information into JSX elements during development. This is what enables the inspector to know which file and line number each component came from.

## Installation

```bash
npm install @rn-dev-inspector/babel-plugin --save-dev
```

## Configuration

Add to your `babel.config.js`:

```js title="babel.config.js"
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@rn-dev-inspector/babel-plugin',
  ],
};
```

## Options

```js title="babel.config.js"
module.exports = {
  plugins: [
    ['@rn-dev-inspector/babel-plugin', {
      // Options here
    }],
  ],
};
```

### `cwd`

- **Type**: `string`
- **Default**: `process.cwd()`

The working directory used to calculate relative file paths.

```js
{
  cwd: '/path/to/project'
}
```

### `excludes`

- **Type**: `(string | RegExp)[]`
- **Default**: `[/node_modules/, /\.expo/, /\.next/]`

Patterns for files to exclude from processing. Files matching these patterns won't have inspector attributes added.

```js
{
  excludes: [
    /node_modules/,
    /\.generated\./,
    'src/legacy/',
  ]
}
```

### `attributePrefix`

- **Type**: `string`
- **Default**: `'data-inspector'`

The prefix for the injected attributes.

```js
{
  attributePrefix: 'data-debug'
}
```

## How It Works

The plugin transforms JSX elements by adding data attributes containing source location:

### Before

```tsx
function MyComponent() {
  return (
    <View>
      <Text>Hello</Text>
    </View>
  );
}
```

### After

```tsx
function MyComponent() {
  return (
    <View
      data-inspector-file="src/MyComponent.tsx"
      data-inspector-line="3"
      data-inspector-column="5"
      data-inspector-component="View"
    >
      <Text
        data-inspector-file="src/MyComponent.tsx"
        data-inspector-line="4"
        data-inspector-column="7"
        data-inspector-component="Text"
      >
        Hello
      </Text>
    </View>
  );
}
```

## Production Builds

The babel plugin only adds attributes in development. In production builds:

- The plugin still runs but the attributes are stripped by React Native's production optimizations
- Zero runtime overhead in production
- No source paths leaked to production builds

## Performance

The plugin is designed to be fast:

- Only processes JSX elements
- Skips already-processed elements
- Skips files matching exclude patterns
- Minimal AST transformations

## Troubleshooting

### Attributes Not Being Added

1. Ensure the plugin is listed in `babel.config.js`
2. Clear Metro cache: `npx react-native start --reset-cache`
3. Check if the file matches an exclude pattern

### Conflicting With Other Plugins

The inspector plugin should generally be listed last in your plugins array to avoid conflicts:

```js
plugins: [
  'other-plugin',
  'another-plugin',
  '@rn-dev-inspector/babel-plugin', // Last
]
```
