# react-native-dev-inspector

Click on React Native components to jump directly to the source code in your IDE.

## Installation

```bash
npm install react-native-dev-inspector
npm install --save-dev @rn-dev-inspector/babel-plugin
```

`react-native-dev-inspector` bundles the Metro middleware, so you don't need to
install `@rn-dev-inspector/metro-plugin` separately.

## Setup

All three steps are required.

### 1. Configure Babel

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

> **The babel plugin is not optional.** It is what records where each element is
> written. React 19 removed the `_source` information that older versions
> attached to elements, so on React 19 / React Native 0.78+ this plugin is the
> only way the inspector can know a component's source location.

### 2. Configure Metro

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withInspector } = require('react-native-dev-inspector/metro');

const config = getDefaultConfig(__dirname);

module.exports = withInspector(config, {
  editor: 'code', // 'code' | 'cursor' | 'webstorm' | etc.
});
```

### 3. Wrap Your App

```tsx
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';

export default function App() {
  return (
    <Inspector>
      <YourApp />
      <InspectorDevMenu position="bottom-right" />
    </Inspector>
  );
}
```

Then restart Metro with a cleared cache — babel config changes are cached:

```bash
npx expo start --clear                 # Expo
npx react-native start --reset-cache   # React Native CLI
```

## Features

- **Click to Inspect** - Tap any component to see its source location
- **Open in Editor** - Jump directly to the source code in your IDE
- **Component Hierarchy** - Navigate the full component tree
- **Box Model** - See margin, padding, and dimensions
- **Style Inspector** - View computed styles
- **Dev Menu Integration** - Toggle from RN dev menu

The inspector is development-only: when `__DEV__` is false, `<Inspector>`
renders its children and nothing else.

## Exports

```tsx
// Components and hooks
import {
  Inspector,
  InspectorDevMenu,
  InspectorButton,
  useInspector,
  toggleInspectorGlobal,
} from 'react-native-dev-inspector';

// Metro plugin
const { withInspector } = require('react-native-dev-inspector/metro');
```

## API

### `<Inspector>`

```tsx
<Inspector
  disabled={false}
  editor="code"
  devServerUrl="http://localhost:8081"  // auto-detected from the bundle URL
  addToDevMenu={true}
  onInspectorEnabled={() => {}}
  onInspectorDisabled={() => {}}
  onElementSelected={(info) => {}}
  onElementTapped={(info) => {}}
>
  {children}
</Inspector>
```

`devServerUrl` defaults to the host that served the JS bundle, so physical
devices and LAN/tunnel setups work without configuration. Set it explicitly only
if you need to override that.

### `<InspectorDevMenu>`

```tsx
<InspectorDevMenu
  position="bottom-right"  // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  compact={false}
  showOnlyWhenInactive={false}
/>
```

### `useInspector()`

```tsx
const {
  isInspecting,
  enableInspector,
  disableInspector,
  toggleInspector,
} = useInspector();
```

### `withInspector()` (Metro)

```js
const { withInspector } = require('react-native-dev-inspector/metro');

module.exports = withInspector(metroConfig, {
  editor: 'code',      // Editor command
  cwd: process.cwd(),  // Working directory for resolving relative paths
});
```

## Supported Editors

VS Code, Cursor, WebStorm, IntelliJ, Sublime, Vim, Neovim, Emacs, Zed, and more.

Set via, in priority order:
- Metro config: `withInspector(config, { editor: 'cursor' })`
- Environment: `REACT_EDITOR=cursor` (in the shell that runs Metro)

## Requirements

- React Native 0.68+
- React 17+
- Metro bundler

## Documentation

Full documentation: [https://vahesaroyan.github.io/react-native-dev-inspector/](https://vahesaroyan.github.io/react-native-dev-inspector/)

## License

MIT
