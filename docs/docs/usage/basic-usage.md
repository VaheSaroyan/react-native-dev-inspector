---
sidebar_position: 1
---

# Basic Usage

This guide covers the basic usage of React Native Dev Inspector in your app.

## Wrapping Your App

The simplest way to use the inspector is to wrap your app with the `Inspector` component:

```tsx title="App.tsx"
import { Inspector } from 'react-native-dev-inspector';

export default function App() {
  return (
    <Inspector>
      <YourApp />
    </Inspector>
  );
}
```

## Enabling the Inspector

There are several ways to enable the inspector:

### 1. Dev Menu Button

Add the `InspectorDevMenu` component to show a floating button:

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

### 2. React Native Dev Menu

The inspector automatically adds an item to React Native's dev menu. Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) and select "Toggle Inspector".

### 3. Programmatically

Use the `useInspector` hook:

```tsx
import { useInspector } from 'react-native-dev-inspector';

function MyButton() {
  const { toggleInspector, isInspecting } = useInspector();

  return (
    <Button
      title={isInspecting ? 'Disable Inspector' : 'Enable Inspector'}
      onPress={toggleInspector}
    />
  );
}
```

## Inspecting Elements

Once the inspector is enabled:

1. A semi-transparent overlay appears over your app
2. Tap on any component
3. The component is highlighted with its name and source location
4. Tap again to open the source file in your editor

## Disabling in Production

The inspector automatically disables itself in production builds. You can also explicitly disable it:

```tsx
<Inspector disabled={!__DEV__}>
  <App />
</Inspector>
```

## Quick Example

```tsx title="App.tsx"
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';

function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Welcome!</Text>
      <TouchableOpacity style={{ marginTop: 20, padding: 10, backgroundColor: '#007AFF' }}>
        <Text style={{ color: 'white' }}>Click Me</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <Inspector>
      <HomeScreen />
      <InspectorDevMenu />
    </Inspector>
  );
}
```

When you enable the inspector and tap on the button, it will open `App.tsx` at the line where `TouchableOpacity` is defined.
