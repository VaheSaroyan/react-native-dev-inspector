---
sidebar_position: 2
---

# Expo Setup

Setting up React Native Dev Inspector with Expo is simple - just one package, two config steps.

## Step 1: Install

```bash
npx expo install react-native-dev-inspector
```

## Step 2: Configure Metro

Create or update your `metro.config.js`:

```js title="metro.config.js"
const { getDefaultConfig } = require('expo/metro-config');
const { withInspector } = require('react-native-dev-inspector/metro');

const config = getDefaultConfig(__dirname);

module.exports = withInspector(config, {
  editor: 'code', // optional - auto-detects if not specified
});
```

## Step 3: Wrap Your App

```tsx title="App.tsx or app/_layout.tsx"
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

### For Expo Router

```tsx title="app/_layout.tsx"
import { Stack } from 'expo-router';
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';

export default function RootLayout() {
  return (
    <Inspector>
      <Stack />
      <InspectorDevMenu position="bottom-right" />
    </Inspector>
  );
}
```

## Step 4: Start Your App

```bash
npx expo start --clear
```

**That's it!** Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to access the dev menu, or tap the floating button.

## Metro Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `editor` | `string` | auto-detect | Editor command (code, cursor, webstorm, etc.) |
| `cwd` | `string` | `process.cwd()` | Working directory for resolving paths |
| `onError` | `function` | - | Callback for launch errors |

## Environment Variables

You can also set the editor via environment variables:

```bash
# Set editor for the session
export REACT_EDITOR=cursor
npx expo start

# Or inline
REACT_EDITOR=webstorm npx expo start
```

## Expo Go vs Development Builds

The inspector works in both Expo Go and development builds:

- **Expo Go**: Works, but editor launching uses URL schemes
- **Development Builds**: Full support with Metro middleware

For the best experience, use development builds (`npx expo run:ios` / `npx expo run:android`).
