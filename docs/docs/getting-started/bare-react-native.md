---
sidebar_position: 3
---

# Bare React Native Setup

For bare React Native projects (without Expo), setup is just as simple.

## Step 1: Install

```bash
npm install react-native-dev-inspector
```

## Step 2: Configure Metro

Update your `metro.config.js` to include the inspector middleware:

```js title="metro.config.js"
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withInspector } = require('react-native-dev-inspector/metro');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  // your custom config
};

module.exports = withInspector(
  mergeConfig(defaultConfig, config),
  {
    editor: 'code', // optional - auto-detects if not specified
  }
);
```

## Step 3: Wrap Your App

```tsx title="App.tsx"
import React from 'react';
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';
import { YourApp } from './YourApp';

export default function App() {
  return (
    <Inspector>
      <YourApp />
      <InspectorDevMenu position="bottom-right" />
    </Inspector>
  );
}
```

## Step 4: Clear Cache and Start

```bash
# Clear Metro cache and start
npx react-native start --reset-cache
```

**That's it!** Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to access the dev menu.

## Metro Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `editor` | `string` | auto-detect | Editor command (code, cursor, webstorm, etc.) |
| `cwd` | `string` | `process.cwd()` | Working directory for resolving paths |
| `onError` | `function` | - | Callback for launch errors |

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
