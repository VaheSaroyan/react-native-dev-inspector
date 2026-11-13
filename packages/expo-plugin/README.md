# @rn-dev-inspector/expo-plugin

Expo config plugin for [React Native Dev Inspector](https://github.com/VaheSaroyan/react-native-dev-inspector).

## What it does, and what it doesn't

This plugin is a **setup helper**, not a runtime integration. It runs during
`expo prebuild` and:

- creates `babel.config.js` and `metro.config.js` with the inspector configured,
  if those files don't exist yet
- prints the exact lines to add if they already exist (it will not rewrite a
  config you wrote yourself)

Because it only runs during prebuild, it does nothing in a managed workflow that
never prebuilds. **Manual setup is the reliable path** — see the
[main README](https://github.com/VaheSaroyan/react-native-dev-inspector#setup).
This plugin exists to save a few steps and to warn you when something is missing.

## Installation

```bash
npx expo install react-native-dev-inspector
npm install --save-dev @rn-dev-inspector/expo-plugin @rn-dev-inspector/babel-plugin
```

## Usage

```json
// app.json
{
  "expo": {
    "plugins": [
      ["@rn-dev-inspector/expo-plugin", { "editor": "code" }]
    ]
  }
}
```

Then run `npx expo prebuild`.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `editor` | `string` | `'code'` | Editor command written into the generated `metro.config.js` |
| `configureBabel` | `boolean` | `true` | Whether to create/check `babel.config.js` |
| `excludes` | `(string \| RegExp)[]` | `[]` | File patterns passed to the babel plugin |

## License

MIT
