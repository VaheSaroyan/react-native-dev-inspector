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

### `injectTestId`

- **Type**: `boolean`
- **Default**: `true`

Whether to set `testID` to the source location. The plugin never replaces a
`testID` you wrote yourself, but if you'd rather it left `testID` alone
entirely, set this to `false` — `dataInspectorSource` still carries the source
information, so the inspector keeps working.

```js
{
  injectTestId: false
}
```

### `enabled`

- **Type**: `boolean`
- **Default**: `false` when Babel's env is `production`, otherwise `true`

Whether the plugin runs at all. By default it is off in production builds so
source paths are never shipped to users. Set it explicitly to override.

```js
{
  enabled: true // inject even in production (not recommended)
}
```

## How It Works

Source locations are encoded as a single string, `ComponentName@file:line:column`,
and attached through up to three props.

### Before

```tsx
function CustomButton({ title }) {
  return (
    <TouchableOpacity>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

### After

```tsx
function CustomButton({ title, __callerSource }) {
  return (
    <TouchableOpacity
      dataInspectorSource="TouchableOpacity@src/CustomButton.tsx:3:5"
      testID={__callerSource || "TouchableOpacity@src/CustomButton.tsx:3:5"}
    >
      <Text
        dataInspectorSource="Text@src/CustomButton.tsx:4:7"
        testID="Text@src/CustomButton.tsx:4:7"
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
```

### The injected props

| Prop | Added to | Purpose |
|------|----------|---------|
| `dataInspectorSource` | every element | Where this element is written. Always added, never overwritten, so it stays correct even when you set your own `testID`. |
| `__callerSource` | your own components | Where the component is **used**. Lets the inspector jump to the call site rather than the definition. |
| `testID` | elements without one | The same source string. On a component's root element it forwards `__callerSource` when the parent supplied one. Disable with `injectTestId: false`. |

Components wrapped in `forwardRef()` and `memo()` are recognised, so their call
sites are forwarded too.

## Production Builds

The plugin is **disabled by default when Babel's env is `production`**, so:

- No source paths are injected into release bundles
- No extra props are added, so there is no runtime or bundle-size cost
- Nothing about your file structure is leaked to users

Nothing strips these props automatically, so this guard is what keeps them out
of release builds. If you override it with `enabled: true`, your source paths
*will* ship. Verify with a release build if it matters to you.

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

Some plugins require a specific position. `react-native-reanimated/plugin` must
be **last**, so place the inspector plugin before it:

```js
plugins: [
  'other-plugin',
  '@rn-dev-inspector/babel-plugin',
  'react-native-reanimated/plugin', // must stay last
]
```

Remember to restart Metro with a cleared cache after any babel config change:

```bash
npx expo start --clear                 # Expo
npx react-native start --reset-cache   # React Native CLI
```
