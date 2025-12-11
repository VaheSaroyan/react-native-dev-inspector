---
sidebar_position: 1
---

# Inspector API

Core Inspector component and related exports.

## Components

### `<Inspector>`

Main wrapper component that enables click-to-source functionality. Wraps your app and provides the inspection UI.

```tsx
import { Inspector } from 'react-native-dev-inspector';

<Inspector
  disabled={false}
  editor="code"
  devServerUrl="http://localhost:8081"
  addToDevMenu={true}
  onInspectorEnabled={() => console.log('Inspector enabled')}
  onInspectorDisabled={() => console.log('Inspector disabled')}
  onElementSelected={(info) => console.log('Selected:', info?.name)}
  onElementTapped={(info) => console.log('Opening:', info.codeInfo)}
>
  <App />
</Inspector>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Your app content to wrap |
| `disabled` | `boolean` | `false` | Completely disable the inspector |
| `editor` | `string` | - | Editor command (e.g., `'code'`, `'cursor'`, `'webstorm'`) |
| `devServerUrl` | `string` | Auto-detect | Metro dev server URL. Defaults to `localhost:8081` (iOS) or `10.0.2.2:8081` (Android) |
| `addToDevMenu` | `boolean` | `true` | Add "Toggle Dev Inspector" to React Native dev menu |
| `onInspectorEnabled` | `() => void` | - | Called when inspector is enabled |
| `onInspectorDisabled` | `() => void` | - | Called when inspector is disabled |
| `onElementSelected` | `(info: InspectInfo \| null) => void` | - | Called when an element is selected |
| `onElementTapped` | `(info: InspectInfo) => void` | - | Called before opening editor |

### `<InspectorDevMenu>`

Floating button to toggle the inspector. Place inside `<Inspector>`.

```tsx
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';

<Inspector>
  <App />
  <InspectorDevMenu
    position="bottom-right"
    compact={true}
    showOnlyWhenInactive={true}
  />
</Inspector>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-right'` | Button position on screen |
| `compact` | `boolean` | `true` | Use smaller 32x32 button (vs 50x50) |
| `showOnlyWhenInactive` | `boolean` | `true` | Hide button when inspector is active |
| `containerStyle` | `object` | - | Custom styles for button container |

**Button Styles:**
- **Compact mode** (`compact={true}`): 32x32 blue button with lightning icon
- **Full mode** (`compact={false}`): 50x50 dark button with magnifying glass icon

### `<InspectorButton>`

Inline button for custom UI integration. Place inside `<Inspector>`.

```tsx
import { InspectorButton } from 'react-native-dev-inspector';

// Default button
<InspectorButton />

// Custom labels
<InspectorButton
  label="Start Inspect"
  activeLabel="Stop Inspect"
  style={{ backgroundColor: '#333' }}
  textStyle={{ color: '#fff' }}
/>

// Render function for complete control
<InspectorButton>
  {(isInspecting, toggle) => (
    <Pressable onPress={toggle}>
      <Icon name={isInspecting ? 'eye-off' : 'eye'} />
    </Pressable>
  )}
</InspectorButton>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `object` | - | Button container styles |
| `textStyle` | `object` | - | Button text styles |
| `label` | `string` | `'Inspect'` | Label when inspector is inactive |
| `activeLabel` | `string` | `'Stop Inspecting'` | Label when inspector is active |
| `children` | `(isInspecting: boolean, toggle: () => void) => ReactNode` | - | Render function for custom UI |

### `<Overlay>`

Visual highlight overlay (used internally by Inspector). Can be used standalone for custom implementations.

```tsx
import { Overlay } from 'react-native-dev-inspector';

<Overlay
  visible={true}
  frame={{ x: 100, y: 200, width: 150, height: 50 }}
  componentInfo={{
    name: 'Button',
    codeInfo: { relativePath: 'src/Button.tsx', lineNumber: 10, columnNumber: 5, componentName: 'Button' },
  }}
  onPress={() => console.log('Overlay tapped')}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | Required | Whether overlay is visible |
| `frame` | `{ x, y, width, height } \| null` | Required | Element position and size |
| `componentInfo` | `{ name, codeInfo } \| null` | - | Component info to display |
| `onPress` | `() => void` | - | Called when overlay is tapped |

## Functions

### `toggleInspectorGlobal()`

Toggle the inspector from anywhere in your app, even outside the Inspector context.

```tsx
import { toggleInspectorGlobal } from 'react-native-dev-inspector';

// In a keyboard shortcut handler, dev tools, etc.
toggleInspectorGlobal();
```

### `launchEditor(options)`

Manually launch the editor for a specific file location.

```tsx
import { launchEditor } from 'react-native-dev-inspector';

await launchEditor({
  codeInfo: {
    relativePath: 'src/Button.tsx',
    lineNumber: 25,
    columnNumber: 5,
    componentName: 'Button',
  },
  editor: 'code',
  devServerUrl: 'http://localhost:8081',
});
```

### `checkDevServer(devServerUrl?)`

Check if the Metro dev server is reachable.

```tsx
import { checkDevServer } from 'react-native-dev-inspector';

const isReachable = await checkDevServer();
// or with custom URL
const isReachable = await checkDevServer('http://localhost:8082');
```

## Types

### `InspectorProps`

```typescript
interface InspectorProps {
  children: ReactNode;
  disabled?: boolean;
  onInspectorEnabled?: () => void;
  onInspectorDisabled?: () => void;
  onElementSelected?: (info: InspectInfo | null) => void;
  onElementTapped?: (info: InspectInfo) => void;
  editor?: string;
  devServerUrl?: string;
  addToDevMenu?: boolean;
}
```

### `InspectorDevMenuProps`

```typescript
interface InspectorDevMenuProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  containerStyle?: object;
  showOnlyWhenInactive?: boolean;
  compact?: boolean;
}
```

### `InspectorButtonProps`

```typescript
interface InspectorButtonProps {
  style?: object;
  textStyle?: object;
  label?: string;
  activeLabel?: string;
  children?: (isInspecting: boolean, toggle: () => void) => React.ReactNode;
}
```

### `InspectInfo`

```typescript
interface InspectInfo {
  fiber: Fiber | null;
  codeInfo: CodeInfo | null;
  name: string;
}
```

### `CodeInfo`

```typescript
interface CodeInfo {
  relativePath: string;
  absolutePath?: string;
  lineNumber: number;
  columnNumber: number;
  componentName: string;
}
```

### `OverlayProps`

```typescript
interface OverlayProps {
  visible: boolean;
  frame: { x: number; y: number; width: number; height: number } | null;
  componentInfo: { name: string; codeInfo: CodeInfo | null } | null;
  onPress?: () => void;
}
```

### `LaunchEditorOptions`

```typescript
interface LaunchEditorOptions {
  codeInfo: CodeInfo;
  editor?: string;
  devServerUrl?: string;
}
```
