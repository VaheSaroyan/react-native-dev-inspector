---
sidebar_position: 2
---

# Expo Setup

Setting up React Native Dev Inspector with Expo is straightforward using our config plugin.

## Step 1: Install Packages

```bash
npx expo install react-native-dev-inspector @rn-dev-inspector/expo-plugin
```

## Step 2: Add Config Plugin

Add the plugin to your `app.json` or `app.config.js`:

```json title="app.json"
{
  "expo": {
    "plugins": [
      "@rn-dev-inspector/expo-plugin"
    ]
  }
}
```

Or with options:

```json title="app.json"
{
  "expo": {
    "plugins": [
      ["@rn-dev-inspector/expo-plugin", {
        "editor": "code"
      }]
    ]
  }
}
```

## Step 3: Wrap Your App

```tsx title="App.tsx"
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';

export default function App() {
  return (
    <Inspector>
      <YourApp />
      <InspectorDevMenu />
    </Inspector>
  );
}
```

## Step 4: Rebuild

Since this modifies native configuration, rebuild your app:

```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

## Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `editor` | `string` | `'code'` | Editor command to use |
| `configureBabel` | `boolean` | `true` | Auto-configure babel plugin |
| `excludes` | `string[]` | `[]` | File patterns to exclude |

## What the Plugin Does

The Expo plugin automatically:

1. **Configures Babel**: Adds `@rn-dev-inspector/babel-plugin` to your `babel.config.js`
2. **Configures Metro**: Adds the inspector middleware to `metro.config.js`

If these files already exist, the plugin will warn you to add the configuration manually.

## Manual Configuration

If you prefer manual setup or the plugin can't modify your existing config:

### babel.config.js

```js title="babel.config.js"
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@rn-dev-inspector/babel-plugin',
    ],
  };
};
```

### metro.config.js

```js title="metro.config.js"
const { getDefaultConfig } = require('expo/metro-config');
const { withInspector } = require('@rn-dev-inspector/metro-plugin');

const config = getDefaultConfig(__dirname);

module.exports = withInspector(config, {
  editor: 'code',
});
```

## Expo Go Limitations

The inspector works best with development builds (`expo run:ios` / `expo run:android`). In Expo Go:

- The babel plugin works
- Metro middleware won't be available
- Editor launching falls back to URL schemes

For the best experience, use development builds.
