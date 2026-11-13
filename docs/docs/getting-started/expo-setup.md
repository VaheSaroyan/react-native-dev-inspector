---
sidebar_position: 2
---

# Expo Setup

Setting up React Native Dev Inspector with Expo takes three pieces of config.
The optional config plugin can scaffold two of them for you.

## Step 1: Install Packages

```bash
npx expo install react-native-dev-inspector
npm install --save-dev @rn-dev-inspector/babel-plugin

# optional: the prebuild setup helper
npm install --save-dev @rn-dev-inspector/expo-plugin
```

:::info
`@rn-dev-inspector/babel-plugin` is required. The config plugin writes it into
your babel config but does not replace it as a dependency.
:::

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

The Expo plugin runs during `expo prebuild` and:

1. **Configures Babel**: creates `babel.config.js` with `@rn-dev-inspector/babel-plugin`, if that file doesn't exist yet
2. **Configures Metro**: creates `metro.config.js` with the inspector middleware, if that file doesn't exist yet

If those files already exist it will **not** rewrite them — it prints the exact
lines to add and you apply them yourself.

:::caution It only runs during prebuild
The config plugin does nothing in a managed workflow that never prebuilds. If
you aren't running `expo prebuild`, use the manual configuration below — it is
the reliable path, and the plugin is only a convenience on top of it.
:::

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

## Expo Go

The inspector works in Expo Go. Both the babel plugin and the Metro middleware
come from your own project's `babel.config.js` and `metro.config.js`, which Expo
Go uses when it loads your bundle from your dev server — so "Open in Editor"
reaches your machine normally.

Two things to keep in mind:

- Your device and the machine running Metro must be able to reach each other.
  The inspector targets the host that served the bundle, so this works over LAN
  and tunnels without extra configuration.
- Development builds (`expo run:ios` / `expo run:android`) still give a better
  dev-menu experience, and are required if you add any custom native code.

## Restart Metro after changing config

Babel config is cached, so after the first setup:

```bash
npx expo start --clear
```
