# @rn-dev-inspector/babel-plugin

Babel plugin for [React Native Dev Inspector](https://github.com/VaheSaroyan/react-native-dev-inspector).
It records where each JSX element is written so the inspector can open that exact
line in your editor.

## Why it's required

React 19 removed the `_source` metadata that earlier versions attached to
elements, so `fiber._debugSource` no longer exists on React 19 / React Native
0.78+. This plugin is the only mechanism that gives the inspector source
locations there, and it is more precise than `_debugSource` on older versions
because it also records *call sites* of your own components.

## Installation

```bash
npm install --save-dev @rn-dev-inspector/babel-plugin
```

## Usage

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // or 'module:@react-native/babel-preset'
    plugins: [
      '@rn-dev-inspector/babel-plugin',
      // 'react-native-reanimated/plugin' must stay last, if you use it
    ],
  };
};
```

Babel config is cached, so restart Metro with a cleared cache after adding it:

```bash
npx expo start --clear                 # Expo
npx react-native start --reset-cache   # React Native CLI
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cwd` | `string` | `process.cwd()` | Base directory used to make source paths relative |
| `excludes` | `(string \| RegExp)[]` | `[]` | Extra file patterns to skip, added to the defaults |
| `injectTestId` | `boolean` | `true` | Set `testID` to the source location. Set to `false` to keep `testID` free for automation testing |

```js
plugins: [
  ['@rn-dev-inspector/babel-plugin', {
    injectTestId: false,
    excludes: [/\/generated\//],
  }],
],
```

Files under `node_modules`, `.expo` and `.next` are always skipped.

## What it injects

Source locations are encoded as `ComponentName@file:line:column`.

```tsx
// You write:
function CustomButton({ title }) {
  return (
    <TouchableOpacity>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}

// Roughly what Babel produces:
function CustomButton({ title, __callerSource }) {
  return (
    <TouchableOpacity
      dataInspectorSource="TouchableOpacity@components/Button.tsx:3:5"
      testID={__callerSource || "TouchableOpacity@components/Button.tsx:3:5"}
    >
      <Text
        dataInspectorSource="Text@components/Button.tsx:4:7"
        testID="Text@components/Button.tsx:4:7"
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
```

Three props carry the information:

- **`dataInspectorSource`** — always added. Records where this element is
  written. Never overwritten, so it stays correct even when you set your own
  `testID`.
- **`__callerSource`** — added to your own components (not host components like
  `View`). Records where the component is *used*, so tapping `<CustomButton />`
  jumps to the line that renders it rather than to the component's definition.
- **`testID`** — set to the source location only when you haven't set one
  yourself. On the root element of a component it forwards `__callerSource` when
  the parent provided one. Set `injectTestId: false` to opt out entirely.

## Keeping your own testIDs

A `testID` you write by hand is never replaced. The inspector falls back to
`dataInspectorSource`, so inspection keeps working alongside automation tests.

## License

MIT
