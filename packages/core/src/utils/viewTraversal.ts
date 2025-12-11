/**
 * View traversal utilities for React Native
 * Provides methods to find and measure views in the component tree
 */

import {
  UIManager,
  findNodeHandle,
} from 'react-native';
import type { RefObject } from 'react';

export interface ViewFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TouchPoint {
  x: number;
  y: number;
}

/**
 * Measure a React Native view and return its frame in window coordinates
 */
export function measureView(
  viewRef: RefObject<any> | any
): Promise<ViewFrame | null> {
  return new Promise((resolve) => {
    const view = viewRef?.current || viewRef;

    if (!view) {
      resolve(null);
      return;
    }

    // Try different measurement methods
    if (typeof view.measureInWindow === 'function') {
      view.measureInWindow((x: number, y: number, width: number, height: number) => {
        resolve({ x, y, width, height });
      });
    } else if (typeof view.measure === 'function') {
      view.measure(
        (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          resolve({ x: pageX, y: pageY, width, height });
        }
      );
    } else {
      // Try via UIManager
      const nodeHandle = findNodeHandle(view);
      if (nodeHandle) {
        UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
          resolve({ x: pageX, y: pageY, width, height });
        });
      } else {
        resolve(null);
      }
    }
  });
}

/**
 * Check if a point is within a frame
 */
export function isPointInFrame(point: TouchPoint, frame: ViewFrame): boolean {
  return (
    point.x >= frame.x &&
    point.x <= frame.x + frame.width &&
    point.y >= frame.y &&
    point.y <= frame.y + frame.height
  );
}

/**
 * Get the React internal instance key from a native view
 */
export function getReactInternalKey(instance: any): string | null {
  if (!instance) return null;

  const keys = Object.keys(instance);

  // Look for React internal keys
  const reactKey = keys.find(
    (key) =>
      key.startsWith('__reactFiber$') ||
      key.startsWith('__reactInternalInstance$') ||
      key === '_reactInternals' ||
      key === '_internalFiberInstanceHandleDEV'
  );

  return reactKey || null;
}

/**
 * Get view hierarchy info for debugging
 */
export function getViewHierarchy(
  view: any,
  depth: number = 0,
  maxDepth: number = 10
): string {
  if (!view || depth > maxDepth) {
    return '';
  }

  const indent = '  '.repeat(depth);
  const type = view.constructor?.name || 'Unknown';

  let result = `${indent}${type}\n`;

  // Try to get children
  const children = view._children || view.props?.children;
  if (Array.isArray(children)) {
    children.forEach((child: any) => {
      if (child && typeof child === 'object') {
        result += getViewHierarchy(child, depth + 1, maxDepth);
      }
    });
  }

  return result;
}

/**
 * Find all touchable areas in a view tree
 * This is useful for debugging touch handling
 */
export async function findTouchableAreas(
  rootRef: RefObject<any>
): Promise<ViewFrame[]> {
  const frames: ViewFrame[] = [];
  const root = rootRef.current;

  if (!root) return frames;

  async function traverse(node: any) {
    if (!node) return;

    // Check if this node is touchable
    const isTouchable =
      node.props?.onPress ||
      node.props?.onPressIn ||
      node.props?.onPressOut ||
      node.props?.onLongPress;

    if (isTouchable) {
      const frame = await measureView(node);
      if (frame) {
        frames.push(frame);
      }
    }

    // Traverse children
    const children = node._children || node.props?.children;
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child && typeof child === 'object') {
          await traverse(child);
        }
      }
    }
  }

  await traverse(root);
  return frames;
}
