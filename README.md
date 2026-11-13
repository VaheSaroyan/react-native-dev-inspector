# React Native Dev Inspector

Click on React Native components to jump directly to the source code in your IDE.

**[Documentation](https://vahesaroyan.github.io/react-native-dev-inspector/)** | [GitHub](https://github.com/VaheSaroyan/react-native-dev-inspector)

Inspired by [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector) for web.

## Features

- **Click to Inspect** - Tap any component to see its source location
- **Open in Editor** - Jump directly to the component's source code in your IDE
- **Component Hierarchy** - Navigate the full component tree with breadcrumb UI
- **Box Model Visualization** - See margin, padding, and dimensions like browser DevTools
- **Style Inspector** - View computed styles of selected components
- **Dev Menu Integration** - Toggle inspector from React Native dev menu (shake or Cmd+D/Cmd+M)
- **Customizable** - Support for VS Code, Cursor, WebStorm, Sublime, and more
- **Expo & CLI Support** - Works with both Expo and React Native CLI projects
- **New Architecture Support** - Works with RN 0.68+, 0.73+, 0.82+ (Fabric)

## Installation

```bash
# npm
npm install react-native-dev-inspector
npm install --save-dev @rn-dev-inspector/babel-plugin

# yarn
yarn add react-native-dev-inspector
yarn add --dev @rn-dev-inspector/babel-plugin

# pnpm
pnpm add react-native-dev-inspector
pnpm add -D @rn-dev-inspector/babel-plugin
```

### For Expo Projects

```bash
npx expo install react-native-dev-inspector
npm install --save-dev @rn-dev-inspector/babel-plugin
```

`react-native-dev-inspector` already depends on the Metro middleware, so you only
need `@rn-dev-inspector/metro-plugin` as a direct dependency if you prefer to
import it by its own name.

All four setup steps below are required. The babel plugin in particular is
**not** optional: React 19 removed the `_source` metadata that earlier versions
attached to elements, so on React 19 / React Native 0.78+ it is the only thing
that gives the inspector a source location.

## Setup

### 1. Configure Babel

Add the babel plugin to your `babel.config.js`:

```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // or 'module:metro-react-native-babel-preset'
    plugins: [
      '@rn-dev-inspector/babel-plugin',
      // ... other plugins
      // 'react-native-reanimated/plugin' must stay last, if you use it
    ],
  };
};
```

### 2. Configure Metro

Add the Metro middleware to your `metro.config.js`:

```js
const { getDefaultConfig } = require('expo/metro-config');
// or: const { getDefaultConfig } = require('@react-native/metro-config');

const { withInspector } = require('react-native-dev-inspector/metro');
// or, if you installed it directly:
// const { withInspector } = require('@rn-dev-inspector/metro-plugin');

const config = getDefaultConfig(__dirname);

module.exports = withInspector(config, {
  editor: 'code', // 'code' | 'cursor' | 'webstorm' | 'sublime' | etc.
});
```

### 3. Wrap Your App

```tsx
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';

export default function App() {
  return (
    <Inspector>
      <YourApp />
      {/* Optional: floating button to toggle inspector */}
      <InspectorDevMenu />
    </Inspector>
  );
}
```

### 4. Restart Metro with a cleared cache

Babel config is cached, so this step is required after the first setup:

```bash
npx expo start --clear                 # Expo
npx react-native start --reset-cache   # React Native CLI
```

### For Expo (Optional Setup Helper)

The Expo config plugin only runs during `expo prebuild`. It scaffolds
`babel.config.js` / `metro.config.js` when they don't exist, and prints the lines
to add when they do. It is a convenience on top of the manual steps above, not a
replacement for them.

Add it to your `app.json`:

```json
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

## Usage

### Toggle Inspector

There are multiple ways to toggle the inspector:

1. **Dev Menu** - Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android), then select "Toggle Dev Inspector"
2. **Floating Button** - Use `<InspectorDevMenu />` component
3. **Programmatically** - Use the `useInspector` hook or `toggleInspectorGlobal()`

```tsx
import { useInspector, toggleInspectorGlobal } from 'react-native-dev-inspector';

// Using hook (inside Inspector)
function MyComponent() {
  const { toggleInspector, isInspecting } = useInspector();

  return (
    <Button
      title={isInspecting ? 'Stop Inspecting' : 'Inspect'}
      onPress={toggleInspector}
    />
  );
}

// Global toggle (anywhere in your app)
toggleInspectorGlobal();
```

### Inspect Components

1. Enable the inspector
2. A "Tap to inspect" hint appears
3. Tap on any component
4. See the component hierarchy, styles, and box model
5. Tap "Open" to jump to the source file in your editor

## API Reference

### `<Inspector>` Component

Main wrapper component that enables inspection.

```tsx
<Inspector
  disabled={false}                    // Disable inspector entirely
  editor="code"                       // Editor command
  devServerUrl="http://localhost:8081" // Optional; defaults to the host that served the bundle
  addToDevMenu={true}                 // Add toggle to RN dev menu
  onInspectorEnabled={() => {}}       // Callback when enabled
  onInspectorDisabled={() => {}}      // Callback when disabled
  onElementSelected={(info) => {}}    // Callback when element selected
  onElementTapped={(info) => {}}      // Callback before opening editor
>
  {children}
</Inspector>
```

`devServerUrl` is detected from the URL Metro served the bundle from, so physical
devices, LAN and tunnel setups work without configuration. Pass it explicitly
only to override that.

### `<InspectorDevMenu>` Component

Floating button for toggling inspector.

```tsx
<InspectorDevMenu
  position="bottom-right"      // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  compact={true}               // Use smaller 32x32 button (vs 50x50)
  showOnlyWhenInactive={true}  // Hide when inspector is active
  containerStyle={{}}          // Custom container styles
/>
```

### `<InspectorButton>` Component

Inline button for custom UI integration.

```tsx
<InspectorButton
  label="Inspect"
  activeLabel="Stop Inspecting"
  style={{}}
  textStyle={{}}
/>

{/* Or with render function for complete control */}
<InspectorButton>
  {(isInspecting, toggle) => (
    <YourCustomButton onPress={toggle} active={isInspecting} />
  )}
</InspectorButton>
```

### `useInspector()` Hook

Access inspector state and controls.

```tsx
const {
  isInspecting,     // boolean - current state
  enableInspector,  // () => void - enable inspector
  disableInspector, // () => void - disable inspector
  toggleInspector,  // () => void - toggle state
} = useInspector();
```

## Supported Editors

| Editor | Command | URL Scheme |
|--------|---------|------------|
| VS Code | `code` | `vscode://` |
| VS Code Insiders | `code-insiders` | `vscode-insiders://` |
| Cursor | `cursor` | `cursor://` |
| WebStorm | `webstorm` | `jetbrains://webstorm/` |
| IntelliJ IDEA | `idea` | `jetbrains://idea/` |
| PhpStorm | `phpstorm` | `jetbrains://phpstorm/` |
| Sublime Text | `subl` | `subl://` |
| Atom | `atom` | `atom://` |
| Vim | `vim` | - |
| Neovim | `nvim` | - |
| Emacs | `emacs` | - |
| Zed | `zed` | `zed://` |
| Android Studio | `studio` | - |
| Xcode | `xed` | - |

Set the editor via, in priority order:

1. Metro plugin option: `withInspector(config, { editor: 'cursor' })`
2. Environment variable: `LAUNCH_EDITOR` or `REACT_EDITOR`, set in the shell
   that runs Metro (e.g. `export REACT_EDITOR=cursor`)
3. Auto-detection from your running processes

An editor set in `metro.config.js` wins over the environment, so a stray
`EDITOR`/`REACT_EDITOR` in your shell cannot silently override the project's
choice.

## How It Works

The inspector works in three stages:

1. **Build Time (Babel Plugin)**: Injects source location metadata into JSX elements:
   - `dataInspectorSource="ComponentName@file:line:column"` - added to every
     element, never overwritten, so it survives your own `testID`s
   - `__callerSource` prop - for user components, tracks WHERE they are used
     (the call site), not where they are defined
   - `testID` - set to the same source string only when you haven't set one
     yourself; on a component's root element it forwards `__callerSource`.
     Opt out with `{ injectTestId: false }`

   This step is required. React 19 removed the `_source` metadata React used to
   attach to elements, so without the plugin there is no source location to find.

2. **Runtime (Inspector Component)**: Uses React Native's internal `getInspectorDataForViewAtPoint` API to:
   - Capture touch events and find the tapped element
   - Traverse the React fiber tree to build the component hierarchy
   - Parse `testID`, `__callerSource` and `dataInspectorSource` to extract
     source locations, falling back to `_debugSource` on React 18 and earlier
   - Display the inspector panel with hierarchy, styles, and box model

3. **Dev Server (Metro Middleware)**: Provides endpoints for opening files:
   - `/__inspect-open-in-editor?file=...&line=...` (GET, react-dev-inspector compatible)
   - `/__open-stack-frame-in-editor` (GET, legacy Metro support)
   - Uses `launch-editor` for cross-platform editor detection and launching

## Architecture

```
+------------------------------------------------------------------+
|                      Your React Native App                        |
|  +------------------------------------------------------------+  |
|  |                      <Inspector>                            |  |
|  |  +------------------------------------------------------+  |  |
|  |  |                  Your Components                      |  |  |
|  |  |  <CustomButton __callerSource="...@App.tsx:25:5" />  |  |  |
|  |  |    <View testID="View@CustomButton.tsx:10:3">        |  |  |
|  |  |      <Text testID="Text@CustomButton.tsx:11:5" />    |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  Inspector Panel: hierarchy | styles | box model      |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              | fetch("/__inspect-open-in-editor?file=...&line=...")
                              v
+------------------------------------------------------------------+
|                       Metro Dev Server                            |
|  +------------------------------------------------------------+  |
|  |              @rn-dev-inspector/metro-plugin                 |  |
|  |  Endpoints:                                                 |  |
|  |  - /__inspect-open-in-editor (GET)                         |  |
|  |  - /__open-stack-frame-in-editor (GET, legacy)             |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              | launch-editor (auto-detects running editor)
                              v
+------------------------------------------------------------------+
|                        Your IDE/Editor                            |
|                     (opens file:line:column)                      |
+------------------------------------------------------------------+
```

## Packages

| Package | Required | Description |
|---------|----------|-------------|
| `react-native-dev-inspector` | yes | Main package with the Inspector component; re-exports the Metro plugin at `/metro` |
| `@rn-dev-inspector/babel-plugin` | yes | Injects source locations into JSX at build time |
| `@rn-dev-inspector/core` | (transitive) | Core inspector implementation |
| `@rn-dev-inspector/metro-plugin` | (transitive) | Metro middleware that launches your editor |
| `@rn-dev-inspector/expo-plugin` | no | Optional `expo prebuild` setup helper |

## Development

This repo is a pnpm workspace.

```bash
pnpm install     # install workspace dependencies
pnpm build       # build all packages (not the docs site)
pnpm test        # run the babel-plugin and metro-plugin test suites
pnpm typecheck   # type-check every package
pnpm build:docs  # build the Docusaurus site
```

Examples live in `examples/` and consume the packages through `file:` links:

| Example | Stack |
|---------|-------|
| `examples/basic-usage` | React Native CLI |
| `examples/expo-usage` | Expo Router |
| `examples/nativewind-usage` | Expo Router + NativeWind |

## Troubleshooting

### Check the dev server first

The middleware exposes a status endpoint. From the machine running Metro:

```bash
curl http://localhost:8081/__rn_dev_inspector__/status
# {"status":"ok","version":"1.2.1","editor":"code"}
```

If this 404s, `withInspector()` is not wired into `metro.config.js`, or Metro
wasn't restarted after you added it.

### Editor doesn't open

The app logs a full checklist to the Metro console when a launch fails, and the
inspector panel shows the reason. Common causes:

1. The editor command isn't on the `PATH` of the shell that started Metro.
   Launching Metro from a GUI app can give it a different `PATH` than your
   terminal — start it from the terminal to check.
2. No editor configured and none detected. Set one explicitly:
   `withInspector(config, { editor: 'code' })`, or `export REACT_EDITOR=code`
   before starting Metro.
3. The dev server can't be reached from the device. The inspector targets the
   host that served the bundle; if you're on a restricted network, pass
   `devServerUrl` to `<Inspector>`.

### Source location not found

The panel shows "No source info available", or the file/line is missing:

1. The babel plugin is almost certainly missing or not applied. Confirm
   `@rn-dev-inspector/babel-plugin` is in the `plugins` array of
   `babel.config.js`.
2. Restart Metro with a cleared cache — babel config is cached:
   `npx expo start --clear` or `npx react-native start --reset-cache`.
3. If you use `react-native-reanimated`, its plugin must stay **last** in the
   plugins array.
4. Source info is not injected for files under `node_modules`, so components
   from libraries will not resolve. That's intentional.

### Wrong file opens for my own components

Tapping a component opens where it's *used*, not where it's defined — that's by
design. The definition is one step up the breadcrumb at the top of the panel.

### Inspector doesn't show up

1. Make sure you're running in development mode (`__DEV__` is true). The
   inspector removes itself entirely in production builds.
2. Wrap your app with the `<Inspector>` component.
3. Check that `disabled` isn't set.
4. If the dev-menu entry is missing, use `<InspectorDevMenu />` or
   `toggleInspectorGlobal()` instead — some runtimes don't expose
   `DevSettings.addMenuItem`.

### testID conflicts with my automation tests

The plugin only sets `testID` when you haven't. If you'd rather it never
touched `testID`, disable that and rely on `dataInspectorSource`:

```js
plugins: [['@rn-dev-inspector/babel-plugin', { injectTestId: false }]],
```

## License

MIT

## Credits

Inspired by [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector) by [@zthxxx](https://github.com/zthxxx).
