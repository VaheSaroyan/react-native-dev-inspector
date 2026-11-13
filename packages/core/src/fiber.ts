/**
 * React Fiber utilities for React Native
 * Used to traverse the fiber tree and extract component information
 */

import type { RefObject } from 'react';

// React Fiber types (internal, may change between React versions)
export interface Fiber {
  tag: number;
  key: string | null;
  elementType: any;
  type: any;
  stateNode: any;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;
  ref: RefObject<any> | ((instance: any) => void) | null;
  pendingProps: any;
  memoizedProps: any;
  memoizedState: any;
  _debugSource?: DebugSource;
  _debugOwner?: Fiber | null;
}

export interface DebugSource {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
}

export interface CodeInfo {
  /** Relative path to the source file */
  relativePath: string;
  /** Absolute path to the source file */
  absolutePath?: string;
  /** Line number (1-indexed) */
  lineNumber: number;
  /** Column number (1-indexed) */
  columnNumber: number;
  /** Component name */
  componentName: string;
}

export interface InspectInfo {
  /** The inspected fiber node */
  fiber: Fiber | null;
  /** Source code information */
  codeInfo: CodeInfo | null;
  /** Component display name */
  name: string;
}

// Fiber tag constants (from React source)
const FiberTags = {
  FunctionComponent: 0,
  ClassComponent: 1,
  IndeterminateComponent: 2,
  HostRoot: 3,
  HostPortal: 4,
  HostComponent: 5,
  HostText: 6,
  Fragment: 7,
  Mode: 8,
  ContextConsumer: 9,
  ContextProvider: 10,
  ForwardRef: 11,
  Profiler: 12,
  SuspenseComponent: 13,
  MemoComponent: 14,
  SimpleMemoComponent: 15,
  LazyComponent: 16,
} as const;

/**
 * Get the fiber node from a React Native view instance
 * React Native stores the fiber on the instance using a special key
 * Supports both old architecture and new architecture (Fabric/bridgeless)
 */
export function getFiberFromInstance(instance: any): Fiber | null {
  if (!instance) return null;

  // Try to get fiber from various sources

  // 1. Direct fiber reference (class components)
  if (instance._reactInternals) {
    return instance._reactInternals as Fiber;
  }

  // 2. For React Native host components (View, Text, etc.)
  // In the old architecture
  if (instance._internalFiberInstanceHandleDEV) {
    return instance._internalFiberInstanceHandleDEV as Fiber;
  }

  // 3. Check for fiber keys on the instance object
  const keys = Object.keys(instance);
  const fiberKey = keys.find(
    (key) =>
      key.startsWith('__reactFiber$') ||
      key.startsWith('__reactInternalInstance$')
  );

  if (fiberKey) {
    return instance[fiberKey] as Fiber;
  }

  // 4. In new architecture (Fabric), try to access via _nativeTag or alternate paths
  // Check if instance has a fiber via _viewConfig or internalInstanceHandle
  if (instance._internalInstanceHandle) {
    const handle = instance._internalInstanceHandle;
    if (handle.stateNode) {
      // This is already a fiber-like structure
      return handle as unknown as Fiber;
    }
  }

  // 5. For ref-based access (from useRef)
  if (instance.current) {
    return getFiberFromInstance(instance.current);
  }

  // 6. Try getNativeProps which exists on some RN components
  if (instance.getNode) {
    try {
      const node = instance.getNode();
      if (node) {
        return getFiberFromInstance(node);
      }
    } catch {
      // getNode might throw
    }
  }

  // 7. Try _nativeTag based lookup (for Fabric renderer)
  if (typeof instance._nativeTag === 'number') {
    // In Fabric, we need to access the fiber differently
    // The fiber might be stored on a global map
    const tag = instance._nativeTag;

    // Try to find fiber through React DevTools hook if available
    if (typeof globalThis !== 'undefined') {
      const hook = (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook && hook.getFiberRoots) {
        try {
          const roots = hook.getFiberRoots(1); // rendererID 1 for React Native
          if (roots && roots.size > 0) {
            for (const root of roots) {
              const fiber = findFiberByNativeTag(root.current, tag);
              if (fiber) {
                return fiber;
              }
            }
          }
        } catch {
          // DevTools hook might not be available or might throw
        }
      }
    }
  }

  return null;
}

/**
 * Find a fiber in the tree by its native tag
 */
function findFiberByNativeTag(fiber: Fiber | null, tag: number): Fiber | null {
  if (!fiber) return null;

  // Check if this fiber's stateNode has the matching tag
  if (fiber.stateNode && fiber.stateNode._nativeTag === tag) {
    return fiber;
  }

  // Check children
  let child = fiber.child;
  while (child) {
    const found = findFiberByNativeTag(child, tag);
    if (found) return found;
    child = child.sibling;
  }

  return null;
}

/**
 * Get the root fiber from the React DevTools hook
 * This is more reliable in the new architecture
 */
export function getRootFiber(): Fiber | null {
  if (typeof globalThis === 'undefined') return null;

  const hook = (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return null;

  // Try to get fiber roots
  if (hook.getFiberRoots) {
    try {
      // rendererID is typically 1 for React Native
      const roots = hook.getFiberRoots(1);
      if (roots && roots.size > 0) {
        for (const root of roots) {
          if (root.current) {
            return root.current;
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }

  // Fallback: try to access renderers directly
  if (hook.renderers) {
    try {
      for (const [, renderer] of hook.renderers) {
        if (renderer.getFiberRoots) {
          const roots = renderer.getFiberRoots();
          if (roots && roots.size > 0) {
            for (const root of roots) {
              if (root.current) {
                return root.current;
              }
            }
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }

  return null;
}

/**
 * Check if the fiber is a user-defined component (not a host component)
 */
export function isUserComponent(fiber: Fiber): boolean {
  return (
    fiber.tag === FiberTags.FunctionComponent ||
    fiber.tag === FiberTags.ClassComponent ||
    fiber.tag === FiberTags.ForwardRef ||
    fiber.tag === FiberTags.MemoComponent ||
    fiber.tag === FiberTags.SimpleMemoComponent
  );
}

/**
 * Check if the fiber is a host component (View, Text, etc.)
 */
export function isHostComponent(fiber: Fiber): boolean {
  return fiber.tag === FiberTags.HostComponent;
}

/**
 * Get the display name of a fiber
 */
export function getFiberName(fiber: Fiber): string {
  const { type, tag } = fiber;

  if (!type) {
    return 'Unknown';
  }

  if (typeof type === 'string') {
    return type;
  }

  if (typeof type === 'function') {
    return type.displayName || type.name || 'Anonymous';
  }

  if (typeof type === 'object') {
    // ForwardRef, Memo, etc.
    if (type.displayName) {
      return type.displayName;
    }
    if (type.render?.displayName || type.render?.name) {
      return type.render.displayName || type.render.name;
    }
    if (type.type?.displayName || type.type?.name) {
      return type.type.displayName || type.type.name;
    }
  }

  // Check for special tags
  switch (tag) {
    case FiberTags.Fragment:
      return 'Fragment';
    case FiberTags.ContextConsumer:
      return 'Context.Consumer';
    case FiberTags.ContextProvider:
      return 'Context.Provider';
    case FiberTags.SuspenseComponent:
      return 'Suspense';
    case FiberTags.Profiler:
      return 'Profiler';
    default:
      return 'Unknown';
  }
}

/**
 * Parse testID in format: ComponentName@file:line:column
 * Example: "CustomButton@components/Button.tsx:25:5"
 */
function parseTestIdForSource(testId: string): CodeInfo | null {
  if (!testId || typeof testId !== 'string') return null;

  const match = testId.match(/^([^@]+)@(.+):(\d+):(\d+)$/);
  if (!match) return null;

  const [, componentName, relativePath, lineStr, columnStr] = match;
  const lineNumber = parseInt(lineStr, 10);
  const columnNumber = parseInt(columnStr, 10);

  if (isNaN(lineNumber) || isNaN(columnNumber)) return null;

  return {
    relativePath,
    lineNumber,
    columnNumber,
    componentName,
  };
}

/**
 * Extract code info from fiber's testID, _debugSource, or inspector attributes
 */
export function getCodeInfoFromFiber(fiber: Fiber): CodeInfo | null {
  const props = fiber.memoizedProps || {};

  // First, try to get from testID (format: ComponentName@file:line:column)
  // This is injected by our babel plugin and is the most reliable method
  const testId = props.testID;
  if (testId) {
    const parsed = parseTestIdForSource(testId);
    if (parsed) return parsed;
  }

  // Second, try to get from _debugSource (injected by React's babel plugin)
  if (fiber._debugSource) {
    const { fileName, lineNumber, columnNumber } = fiber._debugSource;
    return {
      relativePath: fileName,
      absolutePath: fileName,
      lineNumber,
      columnNumber: columnNumber ?? 1,
      componentName: getFiberName(fiber),
    };
  }

  return null;
}

// Patterns to skip when finding source (internal inspector files and RN internals)
const SKIP_SOURCE_PATTERNS = [
  '/Inspector.tsx',
  '/Inspector.js',
  '/Overlay.tsx',
  '/Overlay.js',
  '/DevMenu.tsx',
  '/DevMenu.js',
  '/fiber.ts',
  '/fiber.js',
  '/editor.ts',
  '/editor.js',
  '@rn-dev-inspector',
  'react-native-dev-inspector',
  // React Native internals
  'node_modules/react-native/',
  '/Libraries/Components/StatusBar/',
  // React Navigation internals
  'node_modules/@react-navigation/',
  '@react-navigation/native',
  '@react-navigation/stack',
  '@react-navigation/bottom-tabs',
  '@react-navigation/drawer',
  '@react-navigation/elements',
  '@react-navigation/core',
  // react-native-screens (native layer for React Navigation)
  'node_modules/react-native-screens/',
  'react-native-screens',
];

// Component names to skip (our internal inspector components and RN system components)
const SKIP_COMPONENT_NAMES = [
  // Inspector internals
  'Inspector',
  'InspectorContext',
  'FiberCapture',
  'Overlay',
  'InspectorDevMenu',
  'InspectorButton',
  'TouchInspector',
  'NativeInspectorBridge',
  'NativeInspectorIntegration',
  // React Native system components that don't render visual content
  'StatusBar',
  'RCTStatusBarManager',
  // React Navigation internal components
  'SceneView',
  'CardContainer',
  'Card',
  'CardSheet',
  'CardStack',
  'HeaderConfig',
  'HeaderShownContext',
  'Screen',
  'ScreenContainer',
  'ScreenStack',
  'ScreenStackHeaderConfig',
  'ScreenStackHeaderBackButtonImage',
  'ScreenStackHeaderCenterView',
  'ScreenStackHeaderLeftView',
  'ScreenStackHeaderRightView',
  'ScreenStackHeaderSearchBarView',
  'SearchBar',
  'FullWindowOverlay',
  'NativeScreen',
  'NativeScreenContainer',
  'NativeScreenStack',
  'NativeScreenNavigationContainer',
  'NavigationContainer',
  'NavigationContainerInner',
  'NavigationContent',
  'NavigationRouteContext',
  'NavigationHelpersContext',
  'PreventRemoveProvider',
  'NativeStackView',
  'BottomTabView',
  'DrawerView',
  'TabRouter',
  'StackRouter',
  'DrawerRouter',
  'SafeAreaProviderCompat',
  'SafeAreaInsetsContext',
  'SafeAreaFrameContext',
  // Expo Router internals
  'QualifiedSlot',
  'Slot',
  'RootLayout',
  'Layout',
  'ErrorBoundary',
];

/**
 * Check if a source path should be skipped (internal inspector files)
 */
function shouldSkipSource(relativePath: string): boolean {
  return SKIP_SOURCE_PATTERNS.some(pattern => relativePath.includes(pattern));
}

/**
 * Check if a component name should be skipped (internal inspector components)
 */
function shouldSkipComponent(componentName: string): boolean {
  return SKIP_COMPONENT_NAMES.includes(componentName);
}

/**
 * Find the nearest user component fiber with source info
 * Skips internal inspector components
 */
export function findNearestFiberWithSource(fiber: Fiber | null): InspectInfo | null {
  let current = fiber;
  let fallbackInfo: InspectInfo | null = null;
  let checkedCount = 0;

  while (current) {
    checkedCount++;
    // Check if this fiber has source info
    const codeInfo = getCodeInfoFromFiber(current);
    const componentName = getFiberName(current);

    if (codeInfo) {
      const skipSource = shouldSkipSource(codeInfo.relativePath);
      const skipComponent = shouldSkipComponent(componentName);

      // Skip internal inspector files and component names
      if (skipSource || skipComponent) {
        // Store as fallback in case we don't find anything else
        if (!fallbackInfo) {
          fallbackInfo = {
            fiber: current,
            codeInfo,
            name: componentName,
          };
        }
        current = current.return;
        continue;
      }

      return {
        fiber: current,
        codeInfo,
        name: componentName,
      };
    }

    // Also check _debugOwner for components wrapped in HOCs
    if (current._debugOwner) {
      const ownerInfo = getCodeInfoFromFiber(current._debugOwner);
      const ownerName = getFiberName(current._debugOwner);
      if (ownerInfo && !shouldSkipSource(ownerInfo.relativePath) && !shouldSkipComponent(ownerName)) {
        return {
          fiber: current._debugOwner,
          codeInfo: ownerInfo,
          name: ownerName,
        };
      }
    }

    // Move up the tree
    current = current.return;
  }

  // Return null to trigger fallback search down the tree
  // Don't return fallbackInfo because it would be an internal inspector component
  return null;
}

/**
 * Find the nearest user-defined component (function/class component) with source info
 * This skips host components like Text, View, etc. and finds the actual component definition
 * For example: tapping a Text inside CustomButton will find CustomButton, not Text
 */
export function findNearestUserComponentWithSource(fiber: Fiber | null): InspectInfo | null {
  let current = fiber;
  let hostComponentFallback: InspectInfo | null = null;
  let checkedCount = 0;

  while (current) {
    checkedCount++;
    const codeInfo = getCodeInfoFromFiber(current);
    const componentName = getFiberName(current);

    if (codeInfo) {
      const skipSource = shouldSkipSource(codeInfo.relativePath);
      const skipComponent = shouldSkipComponent(componentName);

      // Skip internal inspector files and component names
      if (skipSource || skipComponent) {
        current = current.return;
        continue;
      }

      // Check if this is a user component (function/class) vs host component (Text, View)
      const isUser = isUserComponent(current);

      if (isUser) {
        // Found a user-defined component - this is what we want!
        return {
          fiber: current,
          codeInfo,
          name: componentName,
        };
      } else {
        // This is a host component - save as fallback but keep looking for user component
        if (!hostComponentFallback) {
          hostComponentFallback = {
            fiber: current,
            codeInfo,
            name: componentName,
          };
        }
      }
    }

    // Check _debugOwner for the actual component that created this element
    if (current._debugOwner) {
      const ownerInfo = getCodeInfoFromFiber(current._debugOwner);
      const ownerName = getFiberName(current._debugOwner);
      if (ownerInfo && !shouldSkipSource(ownerInfo.relativePath) && !shouldSkipComponent(ownerName)) {
        if (isUserComponent(current._debugOwner)) {
          return {
            fiber: current._debugOwner,
            codeInfo: ownerInfo,
            name: ownerName,
          };
        }
      }
    }

    // Move up the tree
    current = current.return;
  }

  // If we didn't find a user component, return the host component fallback
  if (hostComponentFallback) {
    return hostComponentFallback;
  }

  return null;
}

/**
 * Get all parent fibers up to the root
 */
export function getFiberStack(fiber: Fiber | null): Fiber[] {
  const stack: Fiber[] = [];
  let current = fiber;

  while (current) {
    stack.push(current);
    current = current.return;
  }

  return stack;
}

/**
 * Find all components in the fiber tree with source info
 */
export function findAllSourceComponents(fiber: Fiber | null): InspectInfo[] {
  const results: InspectInfo[] = [];

  function traverse(node: Fiber | null) {
    if (!node) return;

    const codeInfo = getCodeInfoFromFiber(node);
    if (codeInfo && isUserComponent(node)) {
      results.push({
        fiber: node,
        codeInfo,
        name: getFiberName(node),
      });
    }

    // Traverse children
    traverse(node.child);
    // Traverse siblings
    traverse(node.sibling);
  }

  traverse(fiber);
  return results;
}

/**
 * Find the first user component with source info by traversing DOWN the fiber tree
 * Skips internal inspector components
 */
export function findFirstUserComponentWithSource(fiber: Fiber | null): InspectInfo | null {
  if (!fiber) return null;

  function traverse(node: Fiber | null): InspectInfo | null {
    if (!node) return null;

    // Check if this fiber has source info
    const codeInfo = getCodeInfoFromFiber(node);
    const componentName = getFiberName(node);

    if (codeInfo && isUserComponent(node)) {
      // Skip internal inspector files and component names
      if (!shouldSkipSource(codeInfo.relativePath) && !shouldSkipComponent(componentName)) {
        return {
          fiber: node,
          codeInfo,
          name: componentName,
        };
      }
    }

    // Traverse children first (depth-first)
    const childResult = traverse(node.child);
    if (childResult) return childResult;

    // Then traverse siblings
    const siblingResult = traverse(node.sibling);
    if (siblingResult) return siblingResult;

    return null;
  }

  return traverse(fiber);
}
