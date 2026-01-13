# react-native-dev-inspector

Click on React Native components to jump directly to the source code in your IDE.

## Installation

```bash
npm install react-native-dev-inspector
```

That's it! Just one package.

## Quick Setup

### 1. Configure Metro

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withInspector } = require('react-native-dev-inspector/metro');

const config = getDefaultConfig(__dirname);

module.exports = withInspector(config, {
  editor: 'code', // 'code' | 'cursor' | 'webstorm' | etc.
});
```

### 2. Wrap Your App

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

**Done!** The inspector works out of the box.

### Optional: Enhanced Source Tracking

For more precise "Open in Editor" functionality, add the babel plugin:

```js
// babel.config.js
const { inspectorBabelPlugin } = require('react-native-dev-inspector/metro');

module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [inspectorBabelPlugin],
};
```

## Features

- **Click to Inspect** - Tap any component to see its source location
- **Open in Editor** - Jump directly to the source code in your IDE
- **Component Hierarchy** - Navigate the full component tree
- **Box Model** - See margin, padding, and dimensions
- **Style Inspector** - View computed styles
- **Dev Menu Integration** - Toggle from RN dev menu
- **Zero Config** - No babel plugin needed

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
  devServerUrl="http://localhost:8081"
  addToDevMenu={true}
  onInspectorEnabled={() => {}}
  onInspectorDisabled={() => {}}
  onElementSelected={(info) => {}}
  onElementTapped={(info) => {}}
>
  {children}
</Inspector>
```

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
  cwd: process.cwd(),  // Working directory
});
```

## Supported Editors

VS Code, Cursor, WebStorm, IntelliJ, Sublime, Vim, Neovim, Emacs, Zed, and more.

Set via:
- Metro config: `withInspector(config, { editor: 'cursor' })`
- Environment: `REACT_EDITOR=cursor`

## Requirements

- React Native 0.68+
- React 17+
- Metro bundler

## Documentation

Full documentation: [https://vahesaroyan.github.io/react-native-dev-inspector/](https://vahesaroyan.github.io/react-native-dev-inspector/)

## License

MIT
