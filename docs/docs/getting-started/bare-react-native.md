---
sidebar_position: 3
---

# Bare React Native Setup

For bare React Native projects (without Expo), you'll need to configure the babel and metro plugins manually.

## Step 1: Install Packages

```bash
npm install react-native-dev-inspector @rn-dev-inspector/babel-plugin @rn-dev-inspector/metro-plugin
```

## Step 2: Configure Babel

Add the babel plugin to your `babel.config.js`:

```js title="babel.config.js"
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Add this plugin
    '@rn-dev-inspector/babel-plugin',
  ],
};
```

### Babel Plugin Options

```js title="babel.config.js"
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@rn-dev-inspector/babel-plugin', {
      // Custom working directory (default: process.cwd())
      cwd: '/path/to/project',

      // Patterns to exclude (default: node_modules, .expo, .next)
      excludes: [/node_modules/, /\.generated\./],

      // Custom attribute prefix (default: 'data-inspector')
      attributePrefix: 'data-inspector',
    }],
  ],
};
```

## Step 3: Configure Metro

Update your `metro.config.js` to include the inspector middleware:

```js title="metro.config.js"
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withInspector } = require('@rn-dev-inspector/metro-plugin');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  // your custom config
};

module.exports = withInspector(
  mergeConfig(defaultConfig, config),
  {
    editor: 'code', // or 'cursor', 'webstorm', etc.
  }
);
```

### Metro Plugin Options

| Option | Type | Description |
|--------|------|-------------|
| `editor` | `string` | Editor command (auto-detected if not set) |
| `cwd` | `string` | Working directory for resolving paths |
| `onError` | `function` | Callback for launch errors |

## Step 4: Wrap Your App

```tsx title="App.tsx"
import React from 'react';
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';
import { YourApp } from './YourApp';

export default function App() {
  return (
    <Inspector>
      <YourApp />
      <InspectorDevMenu />
    </Inspector>
  );
}
```

## Step 5: Clear Cache and Rebuild

```bash
# Clear Metro cache
npx react-native start --reset-cache

# Rebuild iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Rebuild Android
npx react-native run-android
```

## New Architecture (Fabric)

React Native Dev Inspector fully supports the new architecture. No additional configuration is needed - it automatically detects and works with Fabric.

## Environment Variables

You can set the editor via environment variables:

```bash
# Set editor for the session
export REACT_EDITOR=cursor
npx react-native start

# Or inline
REACT_EDITOR=webstorm npx react-native start
```

Priority order:
1. `LAUNCH_EDITOR` env variable
2. `REACT_EDITOR` env variable
3. Metro plugin `editor` option
4. Auto-detect from running processes
