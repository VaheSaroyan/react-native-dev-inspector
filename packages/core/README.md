# @rn-dev-inspector/core

Core inspector components for React Native Dev Inspector.

> **Note**: This is an internal package. For most use cases, install [`react-native-dev-inspector`](https://github.com/VaheSaroyan/react-native-dev-inspector) instead.

## Installation

```bash
npm install @rn-dev-inspector/core
```

## What's Included

This package provides the core inspector functionality:

- **`Inspector`** - Main wrapper component that enables element inspection
- **`InspectorDevMenu`** - Floating button to toggle inspector
- **`InspectorButton`** - Inline button component for custom UIs
- **`useInspector`** - Hook to access inspector state and controls
- **`toggleInspectorGlobal`** - Global function to toggle inspector from anywhere

## Usage

```tsx
import {
  Inspector,
  InspectorDevMenu,
  useInspector
} from '@rn-dev-inspector/core';

export default function App() {
  return (
    <Inspector editor="code">
      <YourApp />
      <InspectorDevMenu position="bottom-right" />
    </Inspector>
  );
}
```

## API

### `<Inspector>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Disable inspector entirely |
| `editor` | `string` | auto | Editor command (code, cursor, webstorm, etc.) |
| `devServerUrl` | `string` | auto | Metro dev server URL |
| `addToDevMenu` | `boolean` | `true` | Add toggle to RN dev menu |
| `onInspectorEnabled` | `() => void` | - | Callback when enabled |
| `onInspectorDisabled` | `() => void` | - | Callback when disabled |
| `onElementSelected` | `(info) => void` | - | Callback when element selected |
| `onElementTapped` | `(info) => void` | - | Callback before opening editor |

### `<InspectorDevMenu>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-right'` | Button position |
| `compact` | `boolean` | `false` | Use smaller button size |
| `showOnlyWhenInactive` | `boolean` | `false` | Hide when inspector active |
| `containerStyle` | `ViewStyle` | - | Custom container styles |

### `useInspector()` Hook

```tsx
const {
  isInspecting,     // boolean
  enableInspector,  // () => void
  disableInspector, // () => void
  toggleInspector,  // () => void
} = useInspector();
```

## How It Works

The inspector uses React Native's internal `getInspectorDataForViewAtPoint` API to:

1. Capture touch events on the screen
2. Find the element at the touch point
3. Traverse the React fiber tree to build component hierarchy
4. Extract source locations from `_debugSource` and component props
5. Display an inspector panel with hierarchy, styles, and box model

## Requirements

- React Native 0.68+
- React 17+
- Development mode (`__DEV__` must be true)

## License

MIT
