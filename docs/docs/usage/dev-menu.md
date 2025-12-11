---
sidebar_position: 3
---

# Dev Menu Integration

React Native Dev Inspector integrates with React Native's developer menu and provides UI components for toggling.

## InspectorDevMenu Component

A floating button that toggles the inspector:

```tsx
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';

function App() {
  return (
    <Inspector>
      <YourApp />
      <InspectorDevMenu />
    </Inspector>
  );
}
```

### Props

#### `position`

- **Type**: `'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`
- **Default**: `'bottom-right'`

Position of the floating button on screen.

```tsx
<InspectorDevMenu position="top-left" />
```

#### `compact`

- **Type**: `boolean`
- **Default**: `true`

Use a smaller, minimal button style.

- **`compact={true}`**: 32x32 blue button with lightning icon
- **`compact={false}`**: 50x50 dark button with magnifying glass icon

```tsx
<InspectorDevMenu compact={false} />
```

#### `showOnlyWhenInactive`

- **Type**: `boolean`
- **Default**: `true`

Hide the floating button when the inspector is active. The inspector panel has its own close button, so this reduces UI clutter.

```tsx
<InspectorDevMenu showOnlyWhenInactive={false} />
```

#### `containerStyle`

- **Type**: `object`
- **Default**: `undefined`

Custom styles for the button container.

```tsx
<InspectorDevMenu containerStyle={{ marginBottom: 20 }} />
```

## InspectorButton Component

A simple inline button for integrating the inspector toggle into your own UI:

```tsx
import { InspectorButton } from 'react-native-dev-inspector';

function MyDevTools() {
  return (
    <View style={styles.devToolsBar}>
      <InspectorButton />
      {/* Other dev tools */}
    </View>
  );
}
```

### Props

#### `style`

- **Type**: `object`

Custom styles for the button container.

#### `textStyle`

- **Type**: `object`

Custom styles for the button text.

#### `label`

- **Type**: `string`
- **Default**: `'Inspect'`

Button label when inspector is inactive.

#### `activeLabel`

- **Type**: `string`
- **Default**: `'Stop Inspecting'`

Button label when inspector is active.

#### `children`

- **Type**: `(isInspecting: boolean, toggle: () => void) => React.ReactNode`

Render function for completely custom button UI.

```tsx
<InspectorButton>
  {(isInspecting, toggle) => (
    <Pressable onPress={toggle} style={styles.customButton}>
      <Icon name={isInspecting ? 'eye-off' : 'eye'} />
      <Text>{isInspecting ? 'Stop' : 'Inspect'}</Text>
    </Pressable>
  )}
</InspectorButton>
```

## React Native Dev Menu

The inspector automatically adds itself to React Native's dev menu when `addToDevMenu={true}` (default).

### Accessing the Dev Menu

| Platform | Method |
|----------|--------|
| iOS Simulator | `Cmd + D` |
| Android Emulator | `Cmd + M` (Mac) or `Ctrl + M` (Windows/Linux) |
| Physical Device | Shake the device |

### Menu Item

The menu item appears as **"Toggle Dev Inspector"** and will enable/disable the inspection mode.

## Custom Integration with useInspector

Build your own UI using the `useInspector` hook:

```tsx
import { useInspector } from 'react-native-dev-inspector';

function CustomInspectorToggle() {
  const { isInspecting, toggleInspector } = useInspector();

  return (
    <Pressable
      onPress={toggleInspector}
      style={[
        styles.toggle,
        isInspecting && styles.toggleActive,
      ]}
    >
      <Icon name={isInspecting ? 'eye' : 'eye-off'} />
      <Text>{isInspecting ? 'Inspecting' : 'Inspect'}</Text>
    </Pressable>
  );
}
```

## Global Toggle

Toggle the inspector from anywhere using `toggleInspectorGlobal`:

```tsx
import { toggleInspectorGlobal } from 'react-native-dev-inspector';

// In a dev tools file, keyboard shortcut handler, etc.
function handleKeyboardShortcut(key: string) {
  if (key === 'i' && isDevMode) {
    toggleInspectorGlobal();
  }
}
```

## Best Practices

### 1. Place InspectorDevMenu Outside Navigation

Ensure the button is visible across all screens:

```tsx
function App() {
  return (
    <Inspector>
      <NavigationContainer>
        <Stack.Navigator>
          {/* screens */}
        </Stack.Navigator>
      </NavigationContainer>
      <InspectorDevMenu />
    </Inspector>
  );
}
```

### 2. Production Safety

Both `InspectorDevMenu` and `InspectorButton` automatically return `null` when `__DEV__` is false, so they're safe to leave in your code:

```tsx
// This is safe - nothing renders in production
<InspectorDevMenu />
```

### 3. Position for Tab Bars

If you have a bottom tab bar, use top position or adjust offset:

```tsx
<InspectorDevMenu
  position="top-right"
  containerStyle={{ top: 100 }} // Below status bar and header
/>

// Or bottom with more offset
<InspectorDevMenu
  position="bottom-right"
  containerStyle={{ bottom: 120 }} // Above tab bar
/>
```

### 4. Combine with Dev Menu

For maximum accessibility, use both the floating button and dev menu:

```tsx
<Inspector addToDevMenu={true}>
  <App />
  <InspectorDevMenu />
</Inspector>
```

This gives users two ways to toggle:
- Quick access via floating button
- Dev menu for discoverability (shake or Cmd+D)
