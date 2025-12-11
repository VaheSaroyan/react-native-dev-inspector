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
npm install react-native-dev-inspector @rn-dev-inspector/babel-plugin @rn-dev-inspector/metro-plugin

# yarn
yarn add react-native-dev-inspector @rn-dev-inspector/babel-plugin @rn-dev-inspector/metro-plugin

# pnpm
pnpm add react-native-dev-inspector @rn-dev-inspector/babel-plugin @rn-dev-inspector/metro-plugin
```

### For Expo Projects

```bash
npx expo install react-native-dev-inspector @rn-dev-inspector/expo-plugin
```

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
    ],
  };
};
```

### 2. Configure Metro

Add the Metro middleware to your `metro.config.js`:

```js
const { getDefaultConfig } = require('expo/metro-config');
// or: const { getDefaultConfig } = require('@react-native/metro-config');

const { withInspector } = require('@rn-dev-inspector/metro-plugin');

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

### For Expo (Alternative Setup)

Add the Expo config plugin to your `app.json`:

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
  devServerUrl="http://localhost:8081" // Custom dev server URL
  addToDevMenu={true}                 // Add toggle to RN dev menu
  onInspectorEnabled={() => {}}       // Callback when enabled
  onInspectorDisabled={() => {}}      // Callback when disabled
  onElementSelected={(info) => {}}    // Callback when element selected
  onElementTapped={(info) => {}}      // Callback before opening editor
>
  {children}
</Inspector>
```

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

Set the editor via:
- Metro plugin option: `withInspector(config, { editor: 'cursor' })`
- Environment variable: `REACT_EDITOR=cursor`

## How It Works

The inspector works in three stages:

1. **Build Time (Babel Plugin)**: Injects source location metadata into JSX elements:
   - `testID="ComponentName@file:line:column"` - for native components (View, Text, etc.)
   - `__callerSource` prop - for user components to track WHERE they are used (call site), not where they are defined
   - `dataInspectorSource` - backup attribute with source info

2. **Runtime (Inspector Component)**: Uses React Native's internal `getInspectorDataForViewAtPoint` API to:
   - Capture touch events and find the tapped element
   - Traverse the React fiber tree to build the component hierarchy
   - Parse `testID` and `__callerSource` to extract source locations
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

| Package | Description |
|---------|-------------|
| `react-native-dev-inspector` | Main package with Inspector component |
| `@rn-dev-inspector/core` | Core inspector functionality |
| `@rn-dev-inspector/babel-plugin` | Babel plugin for source injection |
| `@rn-dev-inspector/metro-plugin` | Metro middleware for editor launching |
| `@rn-dev-inspector/expo-plugin` | Expo config plugin |

## Troubleshooting

### Editor doesn't open

1. Make sure the editor command is in your PATH
2. Set `REACT_EDITOR` environment variable: `export REACT_EDITOR=code`
3. Check the Metro console for error messages

### Source location not found

1. Make sure the babel plugin is configured correctly
2. Clear the Metro bundler cache: `npx react-native start --reset-cache`
3. Rebuild your app

### Inspector doesn't show up

1. Make sure you're running in development mode (`__DEV__` is true)
2. Wrap your app with `<Inspector>` component
3. Check that the component isn't disabled

## License

MIT

## Credits

Inspired by [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector) by [@zthxxx](https://github.com/zthxxx).
