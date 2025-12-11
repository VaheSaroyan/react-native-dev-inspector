---
sidebar_position: 2
---

# Hooks API

React hooks for programmatic inspector control.

## useInspector

Access the inspector context from within the `<Inspector>` component tree.

```tsx
import { useInspector } from 'react-native-dev-inspector';

function MyComponent() {
  const {
    isInspecting,
    enableInspector,
    disableInspector,
    toggleInspector,
  } = useInspector();

  return (
    <Button
      title={isInspecting ? 'Stop Inspecting' : 'Start Inspecting'}
      onPress={toggleInspector}
    />
  );
}
```

### Return Value

```typescript
interface InspectorContextValue {
  /** Whether the inspector is currently active */
  isInspecting: boolean;

  /** Enable the inspector */
  enableInspector: () => void;

  /** Disable the inspector and clear selection */
  disableInspector: () => void;

  /** Toggle the inspector on/off */
  toggleInspector: () => void;
}
```

### Example: Custom Inspector Toggle

```tsx
import { useInspector } from 'react-native-dev-inspector';
import { Pressable, Text, StyleSheet } from 'react-native';

function InspectorToggle() {
  const { isInspecting, toggleInspector } = useInspector();

  return (
    <Pressable
      onPress={toggleInspector}
      style={[
        styles.button,
        isInspecting && styles.buttonActive,
      ]}
    >
      <Text style={styles.text}>
        {isInspecting ? 'Inspecting...' : 'Inspect'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
  text: {
    fontSize: 16,
  },
});
```

### Example: Dev Tools Panel

```tsx
import { useInspector } from 'react-native-dev-inspector';
import { View, Switch, Text } from 'react-native';

function DevToolsPanel() {
  const { isInspecting, toggleInspector } = useInspector();

  return (
    <View style={styles.panel}>
      <Text>Inspector</Text>
      <Switch
        value={isInspecting}
        onValueChange={toggleInspector}
      />
    </View>
  );
}
```

## Global Toggle

For toggling the inspector from outside the Inspector context (e.g., keyboard shortcuts, external dev tools), use `toggleInspectorGlobal`:

```tsx
import { toggleInspectorGlobal } from 'react-native-dev-inspector';

// In a dev tools file, gesture handler, etc.
function handleInspectorGesture() {
  toggleInspectorGlobal();
}
```

## Dev Menu Integration

The inspector automatically registers with React Native's dev menu when `addToDevMenu={true}` (default). You can also manually control dev menu integration:

```tsx
import {
  registerDevMenuToggle,
  isDevMenuAvailable,
  getDevMenuInstructions,
} from 'react-native-dev-inspector';

// Check if dev menu is available
if (isDevMenuAvailable()) {
  console.log(getDevMenuInstructions());
  // iOS: "Shake device or press Cmd+D to open dev menu, then tap "Toggle Inspector""
  // Android: "Shake device or press Cmd+M to open dev menu, then tap "Toggle Inspector""
}

// Register custom toggle callback
registerDevMenuToggle(() => {
  console.log('Inspector toggled from dev menu');
  toggleInspectorGlobal();
});
```

## Fiber Utilities

Low-level utilities for React fiber tree traversal (advanced usage):

```tsx
import {
  getFiberFromInstance,
  getFiberName,
  getCodeInfoFromFiber,
  isUserComponent,
  isHostComponent,
  findNearestFiberWithSource,
  findNearestUserComponentWithSource,
  getFiberStack,
  getRootFiber,
} from 'react-native-dev-inspector';

// Get fiber from a ref
const fiber = getFiberFromInstance(viewRef.current);

// Get component name
const name = getFiberName(fiber); // e.g., "CustomButton"

// Check component type
if (isUserComponent(fiber)) {
  // Function or class component
} else if (isHostComponent(fiber)) {
  // Native component (View, Text, etc.)
}

// Get source code info
const codeInfo = getCodeInfoFromFiber(fiber);
if (codeInfo) {
  console.log(`${codeInfo.relativePath}:${codeInfo.lineNumber}`);
}

// Find nearest component with source info (walking up the tree)
const info = findNearestUserComponentWithSource(fiber);
if (info) {
  console.log(`Found: ${info.name} at ${info.codeInfo?.relativePath}`);
}

// Get full fiber stack to root
const stack = getFiberStack(fiber);
stack.forEach(f => console.log(getFiberName(f)));
```

## Editor Utilities

Functions for launching editors:

```tsx
import {
  launchEditor,
  launchEditorViaInspector,
  launchEditorViaMetro,
  launchEditorViaUrlScheme,
  checkDevServer,
} from 'react-native-dev-inspector';

// Main function - tries all methods
const success = await launchEditor({
  codeInfo: {
    relativePath: 'src/Button.tsx',
    lineNumber: 25,
    columnNumber: 5,
    componentName: 'Button',
  },
  editor: 'code',
});

// Check dev server connectivity
const isConnected = await checkDevServer('http://localhost:8081');
```

### Editor Launch Methods

The `launchEditor` function tries these methods in order:

1. **`launchEditorViaInspector`**: Uses `/__inspect-open-in-editor` endpoint (react-dev-inspector compatible)
2. **`launchEditorViaMetro`**: Uses `/__open-stack-frame-in-editor` endpoint (legacy Metro)
3. **`launchEditorViaUrlScheme`**: Uses deep links (e.g., `vscode://file/path:line:column`)

### Supported URL Schemes

| Editor | URL Scheme |
|--------|------------|
| VS Code | `vscode://file/path:line:column` |
| VS Code Insiders | `vscode-insiders://file/path:line:column` |
| Cursor | `cursor://file/path:line:column` |
| WebStorm | `jetbrains://webstorm/navigate/reference?path=...` |
| Sublime | `subl://open?url=file://path&line=n` |
| Atom | `atom://core/open/file?filename=path&line=n` |
| Zed | `zed://open/path:line:column` |
