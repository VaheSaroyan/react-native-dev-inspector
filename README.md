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
- **Zero Babel Config** - No babel plugin required!

## Installation

```bash
npm install react-native-dev-inspector
```

## Quick Setup (2 steps)

### 1. Configure Metro

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
// or: const { getDefaultConfig } = require('@react-native/metro-config');

const { withInspector } = require('react-native-dev-inspector/metro');

const config = getDefaultConfig(__dirname);

module.exports = withInspector(config, {
  editor: 'code', // 'code' | 'cursor' | 'webstorm' | 'sublime' | etc.
});
```

### 2. Wrap Your App

```tsx
// App.tsx or _layout.tsx (Expo Router)
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';

export default function App() {
  return (
    <Inspector>
      <YourApp />
      {/* Optional: floating button to toggle inspector */}
      <InspectorDevMenu position="bottom-right" />
    </Inspector>
  );
}
```

**That's it!** No babel plugin required.

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

| Editor | Command |
|--------|---------|
| VS Code | `code` |
| VS Code Insiders | `code-insiders` |
| Cursor | `cursor` |
| WebStorm | `webstorm` |
| IntelliJ IDEA | `idea` |
| PhpStorm | `phpstorm` |
| Sublime Text | `subl` |
| Atom | `atom` |
| Vim | `vim` |
| Neovim | `nvim` |
| Emacs | `emacs` |
| Zed | `zed` |
| Android Studio | `studio` |
| Xcode | `xed` |

Set the editor via:
- Metro plugin option: `withInspector(config, { editor: 'cursor' })`
- Environment variable: `REACT_EDITOR=cursor`

## How It Works

The inspector works without any build-time transformations:

1. **Runtime (Inspector Component)**: Uses React Native's internal `getInspectorDataForViewAtPoint` API to:
   - Capture touch events and find the tapped element
   - Traverse the React fiber tree to build the component hierarchy
   - Extract source locations from React's debug info (`_debugSource`)
   - Display the inspector panel with hierarchy, styles, and box model

2. **Dev Server (Metro Plugin)**: Provides an endpoint for opening files:
   - `/__inspect-open-in-editor?file=...&line=...&column=...`
   - Uses `launch-editor` for cross-platform editor detection and launching

## Architecture

```
+------------------------------------------------------------------+
|                      Your React Native App                        |
|  +------------------------------------------------------------+  |
|  |                      <Inspector>                            |  |
|  |  +------------------------------------------------------+  |  |
|  |  |                  Your Components                      |  |  |
|  |  |  <CustomButton />                                    |  |  |
|  |  |    <View>                                            |  |  |
|  |  |      <Text>Click me</Text>                           |  |  |
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
|  |    react-native-dev-inspector/metro (withInspector)        |  |
|  |  Endpoint: /__inspect-open-in-editor                        |  |
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

## Troubleshooting

### Editor doesn't open

1. Make sure the editor command is in your PATH
2. Set `REACT_EDITOR` environment variable: `export REACT_EDITOR=code`
3. Check the Metro console for error messages

### Inspector doesn't show source location

1. Make sure you're running in development mode (`__DEV__` is true)
2. Clear the Metro bundler cache: `npx expo start --clear` or `npx react-native start --reset-cache`
3. Some library components may not have source info available

### Inspector doesn't show up

1. Make sure you're running in development mode (`__DEV__` is true)
2. Wrap your app with `<Inspector>` component
3. Check that the component isn't disabled

## License

MIT

## Credits

Inspired by [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector) by [@zthxxx](https://github.com/zthxxx).
