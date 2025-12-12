/**
 * Main Inspector component for React Native
 *
 * Provides a modified element inspector that opens files in your editor
 * when you tap on a component. Similar to RN's built-in inspector but
 * with "click to open in editor" functionality.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  findNodeHandle,
  SafeAreaView,
} from 'react-native';
import {
  type Fiber,
  type InspectInfo,
  type CodeInfo,
  getCodeInfoFromFiber,
  getFiberName,
  isUserComponent,
} from './fiber';
import { launchEditor } from './editor';
import { registerDevMenuToggle } from './devMenuIntegration';

// Types for React Native's internal inspector API
interface TouchedViewDataAtPoint {
  hierarchy: Array<{
    name?: string;
    getInspectorData: (findNodeHandle: any) => {
      fiber?: any;
      measure?: (callback: (x: number, y: number, width: number, height: number, left: number, top: number) => void) => void;
      props?: Record<string, any>;
      source?: { fileName: string; lineNumber: number };
    };
  }>;
  props: Record<string, any>;
  selectedIndex: number;
  frame: { left: number; top: number; width: number; height: number };
  pointerY: number;
  touchedViewTag: any;
  closestInstance?: any;
}

// Get React Native's getInspectorDataForViewAtPoint function
let getInspectorDataForViewAtPoint: ((
  inspectedView: any,
  locationX: number,
  locationY: number,
  callback: (viewData: TouchedViewDataAtPoint) => boolean,
) => void) | null = null;

// Try to load from different RN versions (must use static requires)
try {
  // RN 0.82+ (new architecture) - uses ES module default export
  const mod = require('react-native/src/private/devsupport/devmenu/elementinspector/getInspectorDataForViewAtPoint');
  getInspectorDataForViewAtPoint = mod.default || mod;
} catch {
  try {
    // RN 0.73-0.81
    const mod = require('react-native/Libraries/Inspector/getInspectorDataForViewAtPoint');
    getInspectorDataForViewAtPoint = mod.default || mod;
  } catch {
    // Could not load getInspectorDataForViewAtPoint
  }
}

// Components to skip
const SKIP_COMPONENT_NAMES = new Set([
  'Inspector',
  'InspectorContext',
  'FiberCapture',
  'Overlay',
  'InspectorDevMenu',
  'InspectorButton',
  'StatusBar',
  'RCTStatusBarManager',
  'InspectorPanel',
  'ElementBox',
  // React internals
  'ForwardRef',
  'React.ForwardRef',
  'Memo',
  'React.Memo',
  'Consumer',
  'Provider',
  'Context',
  'Suspense',
  'Fragment',
  'Profiler',
  'StrictMode',
  'Anonymous',
  'Unknown',
  // Expo Router internals
  'ContextNavigator',
  'ContextNavigationContainer',
  'ExpoRoot',
  'RootErrorBoundary',
  'Try',
  'Freeze',
  'DelayedFreeze',
  'RouterRoot',
  'RootLayoutNav',
  'Navigator',
  'Route',
  'EmptyRoute',
  'QualifiedSlot',
  'Slot',
  'RootLayout',
  'Layout',
  'ErrorBoundary',
]);

export interface InspectorProps {
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

interface InspectorContextValue {
  isInspecting: boolean;
  enableInspector: () => void;
  disableInspector: () => void;
  toggleInspector: () => void;
}

const InspectorContext = createContext<InspectorContextValue>({
  isInspecting: false,
  enableInspector: () => {},
  disableInspector: () => {},
  toggleInspector: () => {},
});

export const useInspector = () => useContext(InspectorContext);

let globalToggleInspector: (() => void) | null = null;

export function toggleInspectorGlobal() {
  globalToggleInspector?.();
}

interface StyleInfo {
  [key: string]: any;
}

interface BoxModelInfo {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  padding: { top: number; right: number; bottom: number; left: number };
  border: { top: number; right: number; bottom: number; left: number };
}

interface HierarchyItem {
  name: string;
  codeInfo: CodeInfo | null;
  fiber: Fiber | null;
  style: StyleInfo | null;
  boxModel: BoxModelInfo | null;
  frame: { x: number; y: number; width: number; height: number } | null;
  measure: ((callback: (x: number, y: number, width: number, height: number, left: number, top: number) => void) => void) | null;
}

interface SelectedElement {
  frame: { x: number; y: number; width: number; height: number } | null;
  hierarchy: HierarchyItem[];
  selectedIndex: number;
  viewTag: number | null;
  closestInstance: any;
}

// Helper to find user component from fiber
function findUserComponentFromFiber(fiber: Fiber | null): InspectInfo | null {
  let current = fiber;

  while (current) {
    const componentName = getFiberName(current);

    if (SKIP_COMPONENT_NAMES.has(componentName)) {
      current = current.return;
      continue;
    }

    const codeInfo = getCodeInfoFromFiber(current);

    if (codeInfo && isUserComponent(current)) {
      return { fiber: current, codeInfo, name: componentName };
    }

    if (current._debugOwner) {
      const ownerName = getFiberName(current._debugOwner);
      if (!SKIP_COMPONENT_NAMES.has(ownerName)) {
        const ownerCodeInfo = getCodeInfoFromFiber(current._debugOwner);
        if (ownerCodeInfo && isUserComponent(current._debugOwner)) {
          return { fiber: current._debugOwner, codeInfo: ownerCodeInfo, name: ownerName };
        }
      }
    }

    current = current.return;
  }

  return null;
}

/**
 * Parse testID in format: ComponentName@file:line:column
 * Example: "CustomButton@components/Button.tsx:25:5"
 * Returns null if testID doesn't match the expected format
 */
function parseTestIdForSource(testId: string): CodeInfo | null {
  if (!testId || typeof testId !== 'string') return null;

  // Match pattern: ComponentName@path/to/file.tsx:line:column
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

// Get the call site location (where a component is USED, not where it's DEFINED)
// This walks up from a fiber to find where it was instantiated
function getCallSiteInfo(fiber: Fiber): CodeInfo | null {
  const props = fiber.memoizedProps || {};

  // First check: testID with source info (format: ComponentName@file:line:column)
  // This is the preferred method as it works reliably with our babel plugin
  const testId = props.testID;
  if (testId) {
    const parsed = parseTestIdForSource(testId);
    if (parsed) {
      return parsed;
    }
  }

  // Second check: the fiber's own _debugSource (where this element was created in JSX)
  if (fiber._debugSource) {
    const source = fiber._debugSource;
    return {
      relativePath: source.fileName,
      lineNumber: source.lineNumber,
      columnNumber: source.columnNumber ?? 1,
      componentName: getFiberName(fiber),
    };
  }

  // Third check: _debugOwner points to the component that rendered this fiber
  // Its _debugSource tells us where the JSX element was written
  if (fiber._debugOwner && fiber._debugOwner._debugSource) {
    const source = fiber._debugOwner._debugSource;
    return {
      relativePath: source.fileName,
      lineNumber: source.lineNumber,
      columnNumber: source.columnNumber ?? 1,
      componentName: getFiberName(fiber),
    };
  }

  return null;
}

// Check if a component name is a user component (starts with uppercase, not a native component)
function isUserComponentName(name: string): boolean {
  if (!name) return false;
  // User components start with uppercase
  const firstChar = name.charAt(0);
  if (firstChar !== firstChar.toUpperCase()) return false;
  // Filter out known native components
  const nativeComponents = ['View', 'Text', 'TouchableOpacity', 'ScrollView', 'Image', 'TextInput', 'Animated', 'RCT'];
  return !nativeComponents.some(native => name === native || name.startsWith('RCT') || name.startsWith('Animated('));
}

// Helper to extract style info from props
function extractStyleInfo(props: any): { style: StyleInfo | null; boxModel: BoxModelInfo | null } {
  if (!props) return { style: null, boxModel: null };

  let flatStyle: StyleInfo = {};

  // Flatten style array or object
  const styleValue = props.style;
  if (styleValue) {
    if (Array.isArray(styleValue)) {
      styleValue.forEach((s: any) => {
        if (s && typeof s === 'object') {
          Object.assign(flatStyle, s);
        }
      });
    } else if (typeof styleValue === 'object') {
      flatStyle = { ...styleValue };
    }
  }

  // Extract box model info
  const boxModel: BoxModelInfo = {
    width: flatStyle.width || 0,
    height: flatStyle.height || 0,
    margin: {
      top: flatStyle.marginTop ?? flatStyle.marginVertical ?? flatStyle.margin ?? 0,
      right: flatStyle.marginRight ?? flatStyle.marginHorizontal ?? flatStyle.margin ?? 0,
      bottom: flatStyle.marginBottom ?? flatStyle.marginVertical ?? flatStyle.margin ?? 0,
      left: flatStyle.marginLeft ?? flatStyle.marginHorizontal ?? flatStyle.margin ?? 0,
    },
    padding: {
      top: flatStyle.paddingTop ?? flatStyle.paddingVertical ?? flatStyle.padding ?? 0,
      right: flatStyle.paddingRight ?? flatStyle.paddingHorizontal ?? flatStyle.padding ?? 0,
      bottom: flatStyle.paddingBottom ?? flatStyle.paddingVertical ?? flatStyle.padding ?? 0,
      left: flatStyle.paddingLeft ?? flatStyle.paddingHorizontal ?? flatStyle.padding ?? 0,
    },
    border: {
      top: flatStyle.borderTopWidth ?? flatStyle.borderWidth ?? 0,
      right: flatStyle.borderRightWidth ?? flatStyle.borderWidth ?? 0,
      bottom: flatStyle.borderBottomWidth ?? flatStyle.borderWidth ?? 0,
      left: flatStyle.borderLeftWidth ?? flatStyle.borderWidth ?? 0,
    },
  };

  // Filter out internal/uninteresting style props for display
  const displayStyle: StyleInfo = {};
  const interestingProps = [
    'backgroundColor', 'color', 'fontSize', 'fontWeight', 'fontFamily',
    'borderRadius', 'borderColor', 'borderWidth',
    'opacity', 'flex', 'flexDirection', 'justifyContent', 'alignItems',
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'paddingHorizontal', 'paddingVertical',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'marginHorizontal', 'marginVertical',
    'position', 'top', 'right', 'bottom', 'left', 'zIndex',
    'shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius', 'elevation',
  ];

  for (const key of interestingProps) {
    if (flatStyle[key] !== undefined) {
      displayStyle[key] = flatStyle[key];
    }
  }

  return {
    style: Object.keys(displayStyle).length > 0 ? displayStyle : null,
    boxModel: (boxModel.width || boxModel.height ||
               boxModel.margin.top || boxModel.margin.right || boxModel.margin.bottom || boxModel.margin.left ||
               boxModel.padding.top || boxModel.padding.right || boxModel.padding.bottom || boxModel.padding.left)
               ? boxModel : null,
  };
}

// Build hierarchy from viewData
function buildHierarchy(viewData: TouchedViewDataAtPoint): HierarchyItem[] {
  const items: HierarchyItem[] = [];
  const seenComponents = new Set<string>();

  // First, collect all hierarchy items with their testIDs and parsed file info
  const hierarchyData: Array<{
    name: string;
    testID?: string;
    parsed?: CodeInfo | null;
    callerSource?: string;
    data: any;
    measure: ((callback: (x: number, y: number, width: number, height: number, left: number, top: number) => void) => void) | null;
  }> = [];

  if (viewData.hierarchy) {
    for (let i = 0; i < viewData.hierarchy.length; i++) {
      const item = viewData.hierarchy[i];
      const name = item.name || 'Unknown';

      // Skip internal components
      if (SKIP_COMPONENT_NAMES.has(name) ||
          name.startsWith('RCT') ||
          name.startsWith('Route(') ||
          name.startsWith('Animated(') ||
          name.startsWith('Context.') ||
          name.startsWith('_')) {
        continue;
      }

      try {
        const data = item.getInspectorData(findNodeHandle);
        const testID = data.props?.testID;
        const callerSource = data.props?.__callerSource;
        const parsed = testID ? parseTestIdForSource(testID) : null;

        // For user components, walk up the fiber tree to find the actual user component fiber
        // which has the __callerSource prop injected by the babel plugin
        if (isUserComponentName(name)) {
          // Walk up the fiber tree to find the user component's fiber
          let componentFiber = data.fiber;
          let walkCount = 0;
          let foundUserComponent = false;

          while (componentFiber && walkCount < 20) {
            const fiberType = componentFiber.type;
            let fiberName: string | null = null;

            if (typeof fiberType === 'function') {
              fiberName = fiberType.displayName || fiberType.name || null;
            } else if (typeof fiberType === 'string') {
              fiberName = fiberType;
            } else if (fiberType && typeof fiberType === 'object') {
              // ForwardRef, Memo, etc.
              fiberName = fiberType.displayName || fiberType.render?.displayName || fiberType.render?.name || null;
            }

            const props = componentFiber.memoizedProps;

            // Check if this fiber has __callerSource in its props
            if (props && props.__callerSource) {
              const callSiteParsed = parseTestIdForSource(props.__callerSource);
              if (callSiteParsed) {
                (data as any)._userComponentCallSite = callSiteParsed;
                foundUserComponent = true;
                break;
              }
            }

            // Also check if this is the target user component and has a matching testID
            if (fiberName === name && props) {
              if (props.__callerSource) {
                const callSiteParsed = parseTestIdForSource(props.__callerSource);
                if (callSiteParsed) {
                  (data as any)._userComponentCallSite = callSiteParsed;
                  foundUserComponent = true;
                  break;
                }
              }
            }

            componentFiber = componentFiber.return;
            walkCount++;
          }
        }

        hierarchyData.push({
          name,
          testID,
          parsed,
          callerSource,
          data,
          measure: data.measure || null,
        });
      } catch {
        hierarchyData.push({ name, data: null, measure: null });
      }
    }
  }

  // Detect file boundaries in the hierarchy to infer user component call sites
  // When we see elements from CustomButton.tsx followed by elements from main-content.tsx,
  // we know CustomButton was called from main-content.tsx
  const fileBoundaries: Array<{ innerFile: string; outerFile: string; outerItem: typeof hierarchyData[0] }> = [];

  let lastFile: string | null = null;
  for (let i = 0; i < hierarchyData.length; i++) {
    const item = hierarchyData[i];
    const currentFile = item.parsed?.relativePath;

    if (currentFile && lastFile && currentFile !== lastFile) {
      // File boundary detected
      fileBoundaries.push({
        innerFile: lastFile,
        outerFile: currentFile,
        outerItem: item,
      });
    }

    if (currentFile) {
      lastFile = currentFile;
    }
  }

  // Now process: for user components, find where they are USED (from parent's file)
  // For native components, show where they are defined
  for (let i = 0; i < hierarchyData.length; i++) {
    const item = hierarchyData[i];
    const { name, testID, parsed, data } = item;

    // Skip internal inspector files
    if (parsed && (parsed.relativePath.includes('/Inspector.tsx') || parsed.relativePath.includes('/packages/core/'))) {
      continue;
    }

    // For user components (like CustomButton, ProfileCard), we want to show WHERE they are used
    // The "usage" location is where <CustomButton> was written in JSX
    if (isUserComponentName(name)) {
      let callSiteInfo: CodeInfo | null = null;

      // PRIORITY 0: Use the call site we found by walking up the fiber tree (stored earlier)
      if ((data as any)?._userComponentCallSite) {
        callSiteInfo = (data as any)._userComponentCallSite;
      }

      // PRIORITY 1: Search ALL hierarchy items for _userComponentCallSite matching this component
      if (!callSiteInfo) {
        for (let j = 0; j < hierarchyData.length; j++) {
          const otherItem = hierarchyData[j];
          const otherCallSite = (otherItem.data as any)?._userComponentCallSite;
          if (otherCallSite && otherCallSite.componentName === name) {
            callSiteInfo = otherCallSite;
            break;
          }
        }
      }

      // PRIORITY 2: Search ALL hierarchy items for a testID that matches component name from different file
      const currentFile = parsed?.relativePath;
      if (!callSiteInfo && currentFile) {
        for (let j = 0; j < hierarchyData.length; j++) {
          const otherItem = hierarchyData[j];
          const otherTestId = otherItem.testID;
          if (otherTestId) {
            const otherParsed = parseTestIdForSource(otherTestId);
            if (otherParsed &&
                otherParsed.componentName === name &&
                otherParsed.relativePath !== currentFile &&
                !otherParsed.relativePath.includes('/Inspector.tsx') &&
                !otherParsed.relativePath.includes('/packages/core/')) {
              callSiteInfo = otherParsed;
              break;
            }
          }
        }
      }

      // PRIORITY 3: File boundary fallback
      if (!callSiteInfo && currentFile) {
        // Find the boundary where we transition from outer file to this component's file
        const boundary = fileBoundaries.find(b => b.innerFile === currentFile);
        if (boundary && boundary.outerItem.parsed) {
          const outerParsed = boundary.outerItem.parsed;
          if (!outerParsed.relativePath.includes('/Inspector.tsx') &&
              !outerParsed.relativePath.includes('/packages/core/')) {
            callSiteInfo = {
              ...outerParsed,
              componentName: name,
            };
          }
        }
      }

      if (callSiteInfo) {
        const key = `${name}:${callSiteInfo.relativePath}:${callSiteInfo.lineNumber}`;
        if (!seenComponents.has(key)) {
          seenComponents.add(key);
          const { style, boxModel } = extractStyleInfo(data?.props);
          items.push({ name, codeInfo: callSiteInfo, fiber: data?.fiber || null, style, boxModel, frame: null, measure: item.measure });
        }
        continue;
      }
    }

    // For native components or when we can't find call site, use the testID directly
    if (testID && parsed) {
      // Check if this native element is in an "inner" file (inside a user component)
      // If there's a file boundary, we should also add the call site entry
      const currentFile = parsed.relativePath;
      const boundary = fileBoundaries.find(b => b.innerFile === currentFile);

      if (boundary && boundary.outerItem.parsed) {
        // Found a boundary! Add the call site as a user component entry
        const outerParsed = boundary.outerItem.parsed;
        // Derive the component name from the file name (e.g., CustomButton.tsx -> CustomButton)
        const innerFileName = currentFile.split('/').pop() || '';
        const componentName = innerFileName.replace(/\.(tsx?|jsx?)$/, '');

        if (componentName && isUserComponentName(componentName)) {
          const callSiteKey = `${componentName}:${outerParsed.relativePath}:${outerParsed.lineNumber}`;
          if (!seenComponents.has(callSiteKey)) {
            seenComponents.add(callSiteKey);
            // Add the user component with call site info
            items.push({
              name: componentName,
              codeInfo: {
                ...outerParsed,
                componentName,
              },
              fiber: null,
              style: null,
              boxModel: null,
              frame: null,
              measure: item.measure,
            });
          }
        }
      }

      // Also add the native element itself
      const key = `${name}:${parsed.relativePath}:${parsed.lineNumber}`;
      if (!seenComponents.has(key)) {
        seenComponents.add(key);
        const { style, boxModel } = extractStyleInfo(data?.props);
        items.push({ name, codeInfo: parsed, fiber: data?.fiber || null, style, boxModel, frame: null, measure: item.measure });
      }
    }
  }

  // If still no items, add items without source for display purposes
  if (items.length === 0 && viewData.hierarchy) {
    for (let i = 0; i < Math.min(viewData.hierarchy.length, 5); i++) {
      const hierItem = viewData.hierarchy[i];
      const name = hierItem.name || 'Unknown';
      if (!name.startsWith('RCT')) {
        let measure = null;
        try {
          const data = hierItem.getInspectorData(findNodeHandle);
          measure = data.measure || null;
        } catch {}
        items.push({ name, codeInfo: null, fiber: null, style: null, boxModel: null, frame: null, measure });
      }
    }
  }

  return items;
}

// FiberCapture component
const FiberCapture: React.FC<{
  onViewRefCapture: (viewRef: View) => void;
  children: ReactNode;
}> = ({ onViewRefCapture, children }) => {
  const ref = useRef<View>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) {
        onViewRefCapture(ref.current);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [onViewRefCapture]);

  return (
    <View ref={ref} style={styles.flex1} collapsable={false}>
      {children}
    </View>
  );
};

// Element highlight box
const ElementBox: React.FC<{
  frame: { x: number; y: number; width: number; height: number };
}> = ({ frame }) => (
  <View
    style={[
      styles.elementBox,
      {
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
      },
    ]}
    pointerEvents="none"
  />
);

// Format style value for display
function formatStyleValue(value: any): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

// Box Model Diagram Component
const BoxModelDiagram: React.FC<{
  boxModel: BoxModelInfo;
  frame: { width: number; height: number } | null;
}> = ({ boxModel, frame }) => {
  const actualWidth = frame?.width ?? boxModel.width;
  const actualHeight = frame?.height ?? boxModel.height;
  const m = boxModel.margin;
  const p = boxModel.padding;

  return (
    <View style={styles.boxModelContainer}>
      {/* Margin box */}
      <View style={styles.boxMargin}>
        <Text style={styles.boxLabelMargin}>margin</Text>
        <Text style={styles.boxValueMarginTop}>{m.top}</Text>
        <View style={styles.boxRowMargin}>
          <Text style={styles.boxValueMarginLeft}>{m.left}</Text>
          {/* Padding box */}
          <View style={styles.boxPadding}>
            <Text style={styles.boxLabelPadding}>padding</Text>
            <Text style={styles.boxValuePaddingTop}>{p.top}</Text>
            <View style={styles.boxRowPadding}>
              <Text style={styles.boxValuePaddingLeft}>{p.left}</Text>
              {/* Content box */}
              <View style={styles.boxContent}>
                <Text style={styles.boxContentSize}>
                  ({actualWidth.toFixed(0)},{'\n'}{actualHeight.toFixed(0)})
                </Text>
                <Text style={styles.boxContentDimensions}>
                  {actualWidth.toFixed(1)} x {actualHeight.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.boxValuePaddingRight}>{p.right}</Text>
            </View>
            <Text style={styles.boxValuePaddingBottom}>{p.bottom}</Text>
          </View>
          <Text style={styles.boxValueMarginRight}>{m.right}</Text>
        </View>
        <Text style={styles.boxValueMarginBottom}>{m.bottom}</Text>
      </View>
    </View>
  );
};

// Style Properties Display (read-only)
const StylePropertiesDisplay: React.FC<{ style: StyleInfo }> = ({ style }) => {
  const entries = Object.entries(style).slice(0, 8); // Limit to 8 props

  return (
    <View style={styles.stylePropsContainer}>
      {entries.map(([key, value]) => (
        <View key={key} style={styles.stylePropRow}>
          <Text style={styles.stylePropKey}>{key}:</Text>
          <Text style={styles.stylePropValue}>{formatStyleValue(value)}</Text>
        </View>
      ))}
    </View>
  );
};

// Inspector Panel (like RN's but with open in editor)
const InspectorPanel: React.FC<{
  hierarchy: HierarchyItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenEditor: (codeInfo: CodeInfo) => void;
  onClose: () => void;
  panelPosition: 'top' | 'bottom';
  frame: { x: number; y: number; width: number; height: number } | null;
}> = ({ hierarchy, selectedIndex, onSelectIndex, onOpenEditor, onClose, panelPosition, frame }) => {
  const selectedItem = hierarchy[selectedIndex];
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Scroll to selected item - use index-based estimation
  React.useEffect(() => {
    if (scrollViewRef.current && hierarchy.length > 0) {
      // Estimate position: ~80px per item on average
      const estimatedX = selectedIndex * 80;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, estimatedX - 40),
          animated: true
        });
      }, 150);
    }
  }, [selectedIndex, hierarchy.length]);

  return (
    <SafeAreaView style={[styles.panel, panelPosition === 'top' ? styles.panelTop : styles.panelBottom]}>
      <View style={styles.panelContent}>
        {/* Hierarchy breadcrumb */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hierarchyScroll}
          contentContainerStyle={styles.hierarchyContentContainer}
        >
          <View style={styles.hierarchyRow}>
            {hierarchy.map((item, index) => (
              <View
                key={index}
                style={styles.hierarchyItemWrapper}
              >
                {index > 0 && <Text style={styles.hierarchySeparator}> › </Text>}
                <TouchableOpacity
                  onPress={() => onSelectIndex(index)}
                  style={[
                    styles.hierarchyItem,
                    index === selectedIndex && styles.hierarchyItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.hierarchyText,
                      index === selectedIndex && styles.hierarchyTextSelected,
                      item.codeInfo && styles.hierarchyTextHasSource,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Selected component info with styles */}
        {selectedItem && (
          <View style={styles.selectedInfo}>
            {/* Top row: styles on left, box model on right */}
            <View style={styles.selectedInfoRow}>
              {/* Left side: name and styles */}
              <View style={styles.stylesColumn}>
                <Text style={styles.selectedName}>{selectedItem.name}</Text>
                {selectedItem.style && (
                  <StylePropertiesDisplay style={selectedItem.style} />
                )}
                {!selectedItem.codeInfo && !selectedItem.style && (
                  <Text style={styles.noSourceText}>No source info available</Text>
                )}
              </View>

              {/* Right side: box model */}
              {(selectedItem.boxModel || frame) && (
                <BoxModelDiagram
                  boxModel={selectedItem.boxModel || {
                    width: frame?.width || 0,
                    height: frame?.height || 0,
                    margin: { top: 0, right: 0, bottom: 0, left: 0 },
                    padding: { top: 0, right: 0, bottom: 0, left: 0 },
                    border: { top: 0, right: 0, bottom: 0, left: 0 },
                  }}
                  frame={frame}
                />
              )}
            </View>

            {/* Bottom: Open in Editor button */}
            {selectedItem.codeInfo && (
              <TouchableOpacity
                style={styles.openEditorButton}
                onPress={() => onOpenEditor(selectedItem.codeInfo!)}
              >
                <Text style={styles.sourceText}>
                  {selectedItem.codeInfo.relativePath.split('/').pop()}:{selectedItem.codeInfo.lineNumber}
                </Text>
                <Text style={styles.openEditorText}>→ Open</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export const Inspector: React.FC<InspectorProps> = ({
  children,
  disabled = false,
  onInspectorEnabled,
  onInspectorDisabled,
  onElementSelected,
  onElementTapped,
  editor,
  devServerUrl,
  addToDevMenu = true,
}) => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement>({
    frame: null,
    hierarchy: [],
    selectedIndex: 0,
    viewTag: null,
    closestInstance: null,
  });
  const [panelPosition, setPanelPosition] = useState<'top' | 'bottom'>('bottom');

  const contentViewRef = useRef<View | null>(null);
  const { height: screenHeight } = Dimensions.get('window');

  const handleViewRefCapture = useCallback((viewRef: View) => {
    contentViewRef.current = viewRef;
  }, []);

  const enableInspector = useCallback(() => {
    if (disabled) return;
    setIsInspecting(true);
    onInspectorEnabled?.();
  }, [disabled, onInspectorEnabled]);

  const disableInspector = useCallback(() => {
    setIsInspecting(false);
    setSelectedElement({ frame: null, hierarchy: [], selectedIndex: 0, viewTag: null, closestInstance: null });
    onInspectorDisabled?.();
  }, [onInspectorDisabled]);

  const toggleInspector = useCallback(() => {
    if (isInspecting) {
      disableInspector();
    } else {
      enableInspector();
    }
  }, [isInspecting, enableInspector, disableInspector]);

  useEffect(() => {
    globalToggleInspector = toggleInspector;
    return () => { globalToggleInspector = null; };
  }, [toggleInspector]);

  useEffect(() => {
    if (!addToDevMenu || disabled || !__DEV__) return;
    registerDevMenuToggle(() => { globalToggleInspector?.(); });
  }, [addToDevMenu, disabled]);

  const openEditor = useCallback((codeInfo: CodeInfo) => {
    launchEditor({ codeInfo, editor, devServerUrl });
  }, [editor, devServerUrl]);

  const inspectAtPoint = useCallback((x: number, y: number) => {
    if (!getInspectorDataForViewAtPoint || !contentViewRef.current) {
      return;
    }

    getInspectorDataForViewAtPoint(
      contentViewRef.current,
      x,
      y,
      (viewData: TouchedViewDataAtPoint) => {
        const hierarchy = buildHierarchy(viewData);
        const frame = viewData.frame;

        // Find the best index - prefer the LAST (most specific) user component
        let bestIndex = hierarchy.length - 1;
        let foundUserComponent = false;

        // Search from the end to find the most specific user component with source info
        for (let i = hierarchy.length - 1; i >= 0; i--) {
          const item = hierarchy[i];
          if (item.codeInfo && isUserComponentName(item.name)) {
            bestIndex = i;
            foundUserComponent = true;
            break;
          }
        }

        // If no user component found, fall back to last item with source info
        if (!foundUserComponent) {
          for (let i = hierarchy.length - 1; i >= 0; i--) {
            if (hierarchy[i].codeInfo) {
              bestIndex = i;
              break;
            }
          }
        }

        // Determine panel position based on touch location
        const newPanelPosition = y < screenHeight / 2 ? 'bottom' : 'top';
        setPanelPosition(newPanelPosition);

        if (frame) {
          // Get the view tag and closestInstance for live style updates
          const viewTag = typeof viewData.touchedViewTag === 'number' ? viewData.touchedViewTag : null;
          const closestInstance = viewData.closestInstance || null;

          setSelectedElement({
            frame: { x: frame.left, y: frame.top, width: frame.width, height: frame.height },
            hierarchy,
            selectedIndex: bestIndex,
            viewTag,
            closestInstance,
          });

          const selectedInfo = hierarchy[bestIndex];
          if (selectedInfo?.codeInfo) {
            onElementSelected?.({
              fiber: selectedInfo.fiber,
              codeInfo: selectedInfo.codeInfo,
              name: selectedInfo.name,
            });
          }
        }

        return true;
      }
    );
  }, [screenHeight, onElementSelected]);

  const handleTouchStart = useCallback((event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    inspectAtPoint(pageX, pageY);
  }, [inspectAtPoint]);

  const handleOpenEditor = useCallback((codeInfo: CodeInfo) => {
    const selectedInfo = selectedElement.hierarchy[selectedElement.selectedIndex];
    if (selectedInfo) {
      onElementTapped?.({
        fiber: selectedInfo.fiber,
        codeInfo,
        name: selectedInfo.name,
      });
    }
    openEditor(codeInfo);
  }, [selectedElement, onElementTapped, openEditor]);

  const handleSelectIndex = useCallback((index: number) => {
    // First update the selected index
    setSelectedElement(prev => ({ ...prev, selectedIndex: index }));

    // Then measure the element and update the frame
    setSelectedElement(prev => {
      const selectedItem = prev.hierarchy[index];
      if (selectedItem?.measure) {
        try {
          selectedItem.measure((x, y, width, height, pageX, pageY) => {
            setSelectedElement(current => ({
              ...current,
              frame: { x: pageX, y: pageY, width, height },
            }));
          });
        } catch {
          // measure might fail, ignore
        }
      }
      return prev;
    });
  }, []);

  const contextValue: InspectorContextValue = {
    isInspecting,
    enableInspector,
    disableInspector,
    toggleInspector,
  };

  if (disabled || !__DEV__) {
    return <>{children}</>;
  }

  return (
    <InspectorContext.Provider value={contextValue}>
      <View style={styles.container}>
        <FiberCapture onViewRefCapture={handleViewRefCapture}>
          {children}
        </FiberCapture>

        {isInspecting && (
          <>
            {/* Touch capture layer */}
            <View
              style={styles.touchLayer}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleTouchStart}
              onResponderMove={handleTouchStart}
            />

            {/* Hint when nothing selected */}
            {!selectedElement.frame && (
              <View style={styles.hintContainer} pointerEvents="none">
                <View style={styles.hintBadge}>
                  <Text style={styles.hintText}>Tap to inspect</Text>
                </View>
              </View>
            )}

            {/* Element highlight */}
            {selectedElement.frame && (
              <ElementBox frame={selectedElement.frame} />
            )}

            {/* Inspector panel */}
            {selectedElement.hierarchy.length > 0 && (
              <InspectorPanel
                hierarchy={selectedElement.hierarchy}
                selectedIndex={selectedElement.selectedIndex}
                onSelectIndex={handleSelectIndex}
                onOpenEditor={handleOpenEditor}
                onClose={disableInspector}
                panelPosition={panelPosition}
                frame={selectedElement.frame}
              />
            )}
          </>
        )}
      </View>
    </InspectorContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  touchLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999998,
  },
  hintContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999997,
  },
  hintBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  elementBox: {
    position: 'absolute',
    backgroundColor: 'rgba(100, 149, 237, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(100, 149, 237, 0.8)',
    zIndex: 999997,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 999999,
  },
  panelContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  panelTop: {
    top: 0,
  },
  panelBottom: {
    bottom: 0,
  },
  hierarchyScroll: {
    maxHeight: 36,
    marginRight: 44,
  },
  hierarchyContentContainer: {
    flexGrow: 1,
  },
  hierarchyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hierarchyItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hierarchySeparator: {
    color: '#666',
    fontSize: 12,
  },
  hierarchyItem: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  hierarchyItemSelected: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  hierarchyText: {
    color: '#888',
    fontSize: 12,
  },
  hierarchyTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  hierarchyTextHasSource: {
    color: '#4FC3F7',
  },
  selectedInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  selectedName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  openEditorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  sourceText: {
    color: '#fff',
    fontSize: 13,
    flex: 1,
  },
  openEditorText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  noSourceText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // New styles for style info and box model
  selectedInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stylesColumn: {
    flex: 1,
    marginRight: 12,
  },
  stylePropsContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  stylePropRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  stylePropKey: {
    color: '#9575CD',
    fontSize: 11,
    marginRight: 4,
  },
  stylePropValue: {
    color: '#CE93D8',
    fontSize: 11,
  },
  // Box model styles
  boxModelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  boxMargin: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.4)',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  boxLabelMargin: {
    color: '#FFA726',
    fontSize: 8,
    alignSelf: 'flex-start',
    marginBottom: 1,
  },
  boxValueMarginTop: {
    color: '#FFA726',
    fontSize: 10,
  },
  boxValueMarginBottom: {
    color: '#FFA726',
    fontSize: 10,
  },
  boxValueMarginLeft: {
    color: '#FFA726',
    fontSize: 10,
    marginRight: 4,
  },
  boxValueMarginRight: {
    color: '#FFA726',
    fontSize: 10,
    marginLeft: 4,
  },
  boxRowMargin: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxPadding: {
    backgroundColor: 'rgba(102, 187, 106, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(102, 187, 106, 0.5)',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  boxLabelPadding: {
    color: '#66BB6A',
    fontSize: 8,
    alignSelf: 'flex-end',
    marginBottom: 1,
  },
  boxValuePaddingTop: {
    color: '#66BB6A',
    fontSize: 10,
  },
  boxValuePaddingBottom: {
    color: '#66BB6A',
    fontSize: 10,
  },
  boxValuePaddingLeft: {
    color: '#66BB6A',
    fontSize: 10,
    marginRight: 4,
  },
  boxValuePaddingRight: {
    color: '#66BB6A',
    fontSize: 10,
    marginLeft: 4,
  },
  boxRowPadding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxContent: {
    backgroundColor: 'rgba(66, 165, 245, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(66, 165, 245, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 70,
  },
  boxContentSize: {
    color: '#FFD54F',
    fontSize: 9,
    textAlign: 'center',
  },
  boxContentDimensions: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
});
