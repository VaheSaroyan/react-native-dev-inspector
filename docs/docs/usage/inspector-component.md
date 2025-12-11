---
sidebar_position: 2
---

# Inspector Component

The `Inspector` component is the main wrapper that enables click-to-source functionality.

## Basic Usage

```tsx
import { Inspector } from 'react-native-dev-inspector';

function App() {
  return (
    <Inspector>
      <YourApp />
    </Inspector>
  );
}
```

## Props

### `children`

- **Type**: `ReactNode`
- **Required**: Yes

The content to wrap with inspection capabilities.

### `disabled`

- **Type**: `boolean`
- **Default**: `false`

Disables the inspector. Useful for conditionally disabling in certain environments.

```tsx
<Inspector disabled={!__DEV__}>
  <App />
</Inspector>
```

### `editor`

- **Type**: `string`
- **Default**: Auto-detected

Override the editor to use.

```tsx
<Inspector editor="cursor">
  <App />
</Inspector>
```

### `devServerUrl`

- **Type**: `string`
- **Default**: Auto-detected based on platform

Custom dev server URL. Useful when running Metro on a non-standard port.

```tsx
<Inspector devServerUrl="http://localhost:3000">
  <App />
</Inspector>
```

### `addToDevMenu`

- **Type**: `boolean`
- **Default**: `true`

Whether to add "Toggle Inspector" to React Native's dev menu.

```tsx
<Inspector addToDevMenu={false}>
  <App />
</Inspector>
```

### `onInspectorEnabled`

- **Type**: `() => void`

Callback when the inspector is enabled.

```tsx
<Inspector onInspectorEnabled={() => console.log('Inspector enabled!')}>
  <App />
</Inspector>
```

### `onInspectorDisabled`

- **Type**: `() => void`

Callback when the inspector is disabled.

### `onElementSelected`

- **Type**: `(info: InspectInfo | null) => void`

Callback when an element is selected/hovered.

```tsx
<Inspector
  onElementSelected={(info) => {
    if (info) {
      console.log('Selected:', info.name, info.codeInfo?.relativePath);
    }
  }}
>
  <App />
</Inspector>
```

### `onElementTapped`

- **Type**: `(info: InspectInfo) => void`

Callback when an element is tapped (before opening editor).

```tsx
<Inspector
  onElementTapped={(info) => {
    // Custom logic before opening editor
    analytics.track('inspector_tap', { component: info.name });
  }}
>
  <App />
</Inspector>
```

## InspectInfo Type

```typescript
interface InspectInfo {
  /** The React fiber for this component */
  fiber: Fiber;
  /** Component name */
  name: string;
  /** Source code information */
  codeInfo: {
    /** Relative file path */
    relativePath: string;
    /** Absolute file path */
    absolutePath: string;
    /** Line number (1-indexed) */
    lineNumber: number;
    /** Column number (1-indexed) */
    columnNumber: number;
    /** Component name from source */
    componentName?: string;
  } | null;
}
```

## Context

The `Inspector` component provides context that can be accessed with `useInspector`:

```tsx
import { useInspector } from 'react-native-dev-inspector';

function InspectorStatus() {
  const {
    isInspecting,
    enableInspector,
    disableInspector,
    toggleInspector,
  } = useInspector();

  return (
    <Text>Inspector is {isInspecting ? 'ON' : 'OFF'}</Text>
  );
}
```

## Styling

The inspector overlay uses an absolute positioned view with high zIndex. It doesn't affect your app's layout.

The highlight box uses these default styles:
- Border: 2px solid with semi-transparent blue
- Background: Semi-transparent blue fill
- Label: Component name and file path

## Performance

The `Inspector` component:
- Only activates touch handling when inspection is enabled
- Uses React Native's internal inspector APIs when available
- Minimal overhead when disabled
- No impact on production builds
