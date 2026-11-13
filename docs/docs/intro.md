---
sidebar_position: 1
slug: /
---

# React Native Dev Inspector

**Click on any React Native component to instantly jump to its source code in your IDE.**

React Native Dev Inspector is a developer tool that allows you to tap on any component in your React Native app and immediately open the corresponding source file at the exact line number in your preferred editor.

## Features

- **Click-to-Source**: Tap any component to open its source file in your IDE
- **Component Hierarchy**: View the full component tree with breadcrumb navigation
- **Box Model Visualization**: See margin, padding, and dimensions like browser DevTools
- **Style Inspector**: View computed styles of selected components
- **New Architecture Support**: Works with both old and new React Native architecture (RN 0.68+, 0.73+, 0.82+)
- **Expo Compatible**: First-class Expo support with config plugin
- **Dev Menu Integration**: Toggle inspector from React Native dev menu (shake or Cmd+D/Cmd+M)
- **Zero Runtime Overhead**: Only active in `__DEV__` mode

## Quick Start

### For Expo Projects

```bash
npx expo install react-native-dev-inspector @rn-dev-inspector/expo-plugin
```

Add to your `app.json`:

```json
{
  "expo": {
    "plugins": ["@rn-dev-inspector/expo-plugin"]
  }
}
```

### For Bare React Native

```bash
npm install react-native-dev-inspector @rn-dev-inspector/babel-plugin @rn-dev-inspector/metro-plugin
```

See the [Getting Started](/docs/getting-started/installation) guide for detailed setup instructions.

## How It Works

1. **Babel Plugin**: Injects source location metadata into JSX elements during development:
   - `testID="ComponentName@file:line:column"` for native components (View, Text, etc.)
   - `__callerSource` prop for user components to track WHERE they are used (call site)
   - `dataInspectorSource` as a backup attribute

2. **Inspector Component**: Captures touch events and uses React Native's internal `getInspectorDataForViewAtPoint` API to:
   - Traverse the React fiber tree and build component hierarchy
   - Parse `testID` and `__callerSource` to extract source locations
   - Display the inspector panel with styles and box model

3. **Metro Plugin**: Provides endpoints for opening files in your editor:
   - `/__inspect-open-in-editor?file=...&line=...` (primary)
   - Uses `launch-editor` for cross-platform editor detection

4. **Editor Integration**: Supports VS Code, Cursor, WebStorm, Sublime, and more via URL schemes or command-line

## Supported Editors

- VS Code / VS Code Insiders
- Cursor
- WebStorm / PhpStorm / IntelliJ IDEA
- Sublime Text
- Atom
- Vim / Neovim
- Emacs
- Zed
- Android Studio
- Xcode

## Demo

```tsx
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

When the inspector is enabled:
1. A "Tap to inspect" hint appears
2. Tap any component to see its hierarchy, styles, and box model
3. Tap "Open" to jump to the source file in your editor
