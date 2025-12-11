---
sidebar_position: 4
---

# Fiber Utilities API

Low-level utilities for working with React fibers.

:::caution Advanced Usage
These utilities are for advanced use cases. Most users should use the high-level `Inspector` component instead.
:::

## getFiberFromInstance

Get the React fiber from a native view instance.

```tsx
import { getFiberFromInstance } from 'react-native-dev-inspector';

const viewRef = useRef<View>(null);

// Later...
const fiber = getFiberFromInstance(viewRef.current);
```

### Parameters

- `instance: any` - A React Native view instance

### Return Value

```typescript
Fiber | null
```

## findNearestFiberWithSource

Find the nearest fiber in the tree that has source information.

```tsx
import { findNearestFiberWithSource } from 'react-native-dev-inspector';

const info = findNearestFiberWithSource(fiber);
if (info) {
  console.log('Component:', info.name);
  console.log('File:', info.codeInfo?.relativePath);
  console.log('Line:', info.codeInfo?.lineNumber);
}
```

### Parameters

- `fiber: Fiber` - Starting fiber

### Return Value

```typescript
interface InspectInfo {
  fiber: Fiber;
  codeInfo: CodeInfo | null;
  name: string;
} | null
```

## getCodeInfoFromFiber

Extract source code information from a fiber.

```tsx
import { getCodeInfoFromFiber } from 'react-native-dev-inspector';

const codeInfo = getCodeInfoFromFiber(fiber);
if (codeInfo) {
  console.log(`${codeInfo.relativePath}:${codeInfo.lineNumber}`);
}
```

### Return Value

```typescript
interface CodeInfo {
  relativePath: string;
  absolutePath: string;
  lineNumber: number;
  columnNumber: number;
  componentName?: string;
} | null
```

## getFiberName

Get the display name of a fiber.

```tsx
import { getFiberName } from 'react-native-dev-inspector';

const name = getFiberName(fiber); // e.g., "View", "Text", "MyComponent"
```

## getRootFiber

Get the root fiber from the React DevTools hook.

```tsx
import { getRootFiber } from 'react-native-dev-inspector';

const rootFiber = getRootFiber();
if (rootFiber) {
  // Traverse the fiber tree
}
```

## isUserComponent

Check if a fiber represents a user-defined component (not a host component).

```tsx
import { isUserComponent } from 'react-native-dev-inspector';

if (isUserComponent(fiber)) {
  // This is a function/class component, not a View/Text
}
```

## isHostComponent

Check if a fiber represents a host component (View, Text, etc.).

```tsx
import { isHostComponent } from 'react-native-dev-inspector';

if (isHostComponent(fiber)) {
  // This is a native view element
}
```

## getFiberStack

Get all parent fibers up to the root.

```tsx
import { getFiberStack } from 'react-native-dev-inspector';

const stack = getFiberStack(fiber);
// Returns array from fiber up to root
```

## findAllSourceComponents

Find all components with source info in a subtree.

```tsx
import { findAllSourceComponents } from 'react-native-dev-inspector';

const components = findAllSourceComponents(rootFiber, 10); // max depth
// Returns array of InspectInfo for all components
```

## Fiber Type

The `Fiber` type represents a React Fiber node:

```typescript
interface Fiber {
  tag: number;
  type: any;
  stateNode: any;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  _debugSource?: DebugSource;
  _debugOwner?: Fiber;
  // ... other internal properties
}

interface DebugSource {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
}
```

## Example: Custom Fiber Traversal

```tsx
import {
  getRootFiber,
  getFiberName,
  getCodeInfoFromFiber,
  isUserComponent,
} from 'react-native-dev-inspector';

function logComponentTree() {
  const root = getRootFiber();
  if (!root) return;

  function traverse(fiber: Fiber, depth = 0) {
    const indent = '  '.repeat(depth);
    const name = getFiberName(fiber);
    const codeInfo = getCodeInfoFromFiber(fiber);
    const isUser = isUserComponent(fiber);

    if (isUser && codeInfo) {
      console.log(`${indent}${name} (${codeInfo.relativePath}:${codeInfo.lineNumber})`);
    }

    if (fiber.child) traverse(fiber.child, depth + 1);
    if (fiber.sibling) traverse(fiber.sibling, depth);
  }

  traverse(root);
}
```
