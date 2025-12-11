/**
 * Touch-based Inspector for React Native
 * Uses PanResponder for more reliable touch handling
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  Platform,
  DevSettings,
  type GestureResponderEvent,
  type PanResponderGestureState,
  type LayoutChangeEvent,
} from 'react-native';
import { Overlay } from './Overlay';
import {
  getFiberFromInstance,
  findNearestFiberWithSource,
  type InspectInfo,
} from './fiber';
import { launchEditor } from './editor';
import type { InspectorProps } from './Inspector';

export interface TouchInspectorRef {
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  isEnabled: boolean;
}

interface ElementInfo {
  frame: { x: number; y: number; width: number; height: number };
  info: InspectInfo | null;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Alternative Inspector implementation using PanResponder
 * More reliable touch handling for complex gesture scenarios
 */
export const TouchInspector = forwardRef<TouchInspectorRef, InspectorProps>(
  (
    {
      children,
      disabled = false,
      onInspectorEnabled,
      onInspectorDisabled,
      onElementSelected,
      onElementTapped,
      editor,
      devServerUrl,
      addToDevMenu = true,
    },
    ref
  ) => {
    const [isInspecting, setIsInspecting] = useState(false);
    const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);

    const containerRef = useRef<View>(null);
    const childRefs = useRef<Map<string, { ref: View; layout: any }>>(new Map());

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      enable: () => {
        setIsInspecting(true);
        onInspectorEnabled?.();
      },
      disable: () => {
        setIsInspecting(false);
        setSelectedElement(null);
        onInspectorDisabled?.();
      },
      toggle: () => {
        setIsInspecting((prev) => {
          const next = !prev;
          if (next) {
            onInspectorEnabled?.();
          } else {
            setSelectedElement(null);
            onInspectorDisabled?.();
          }
          return next;
        });
      },
      isEnabled: isInspecting,
    }));

    // Register with dev menu
    useEffect(() => {
      if (!addToDevMenu || disabled || !__DEV__) return;

      if (DevSettings?.addMenuItem) {
        DevSettings.addMenuItem('Toggle Touch Inspector', () => {
          setIsInspecting((prev) => !prev);
        });
      }
    }, [addToDevMenu, disabled]);

    // Create pan responder for inspection
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => isInspecting,
        onMoveShouldSetPanResponder: () => false,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          if (!isInspecting) return;

          const { pageX, pageY } = event.nativeEvent;
          handleTouch(pageX, pageY);
        },
        onPanResponderRelease: (event: GestureResponderEvent) => {
          if (!isInspecting) return;

          // Handle tap to open editor
          if (selectedElement?.info?.codeInfo) {
            handleOpenEditor();
          }
        },
      })
    ).current;

    const handleTouch = useCallback(
      (x: number, y: number) => {
        // Find the view at this position
        // In React Native, we need to traverse the fiber tree to find the component

        // For now, we'll use a simplified approach:
        // Get the fiber from the container and traverse
        if (containerRef.current) {
          const fiber = getFiberFromInstance(containerRef.current);

          if (fiber) {
            // Find child fiber at position
            const inspectInfo = findComponentAtPosition(fiber, x, y);

            if (inspectInfo) {
              setSelectedElement({
                frame: {
                  x: x - 50, // Approximate frame around touch point
                  y: y - 25,
                  width: 100,
                  height: 50,
                },
                info: inspectInfo,
              });
              onElementSelected?.(inspectInfo);
            }
          }
        }
      },
      [onElementSelected]
    );

    const handleOpenEditor = useCallback(() => {
      if (!selectedElement?.info?.codeInfo) return;

      onElementTapped?.(selectedElement.info);

      launchEditor({
        codeInfo: selectedElement.info.codeInfo,
        editor,
        devServerUrl,
      });

      // Disable inspector after opening
      setIsInspecting(false);
      setSelectedElement(null);
      onInspectorDisabled?.();
    }, [
      selectedElement,
      onElementTapped,
      editor,
      devServerUrl,
      onInspectorDisabled,
    ]);

    if (disabled || !__DEV__) {
      return <>{children}</>;
    }

    return (
      <View
        style={styles.container}
        ref={containerRef}
        collapsable={false}
        {...(isInspecting ? panResponder.panHandlers : {})}
      >
        {children}

        {isInspecting && selectedElement && (
          <Overlay
            visible={true}
            frame={selectedElement.frame}
            componentInfo={
              selectedElement.info
                ? {
                    name: selectedElement.info.name,
                    codeInfo: selectedElement.info.codeInfo,
                  }
                : null
            }
            onPress={handleOpenEditor}
          />
        )}
      </View>
    );
  }
);

/**
 * Find component at a specific position by traversing the fiber tree
 * This is a simplified implementation - a full implementation would need
 * to maintain a mapping of fibers to their layout positions
 */
function findComponentAtPosition(
  fiber: any,
  x: number,
  y: number
): InspectInfo | null {
  // Start from the fiber and look for components with source info
  // In practice, you'd want to check if the fiber's stateNode
  // contains the touched position

  return findNearestFiberWithSource(fiber);
}

TouchInspector.displayName = 'TouchInspector';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
