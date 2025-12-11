/**
 * Overlay component for highlighting inspected elements
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import type { CodeInfo } from './fiber';

export interface OverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Position and dimensions of the highlighted element */
  frame: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  /** Component information to display */
  componentInfo: {
    name: string;
    codeInfo: CodeInfo | null;
  } | null;
  /** Callback when the overlay is tapped (to open editor) */
  onPress?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Overlay: React.FC<OverlayProps> = ({
  visible,
  frame,
  componentInfo,
  onPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible || !frame) {
    return null;
  }

  const infoPosition = calculateInfoPosition(frame);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
      ]}
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      {/* Highlight box around the element */}
      <View
        style={[
          styles.highlightBox,
          {
            left: frame.x,
            top: frame.y,
            width: frame.width,
            height: frame.height,
          },
        ]}
      />

      {/* Border overlay */}
      <View
        style={[
          styles.highlightBorder,
          {
            left: frame.x - 2,
            top: frame.y - 2,
            width: frame.width + 4,
            height: frame.height + 4,
          },
        ]}
      />

      {/* Component info tooltip */}
      {componentInfo && (
        <View
          style={[
            styles.infoContainer,
            {
              left: infoPosition.x,
              top: infoPosition.y,
            },
          ]}
        >
          <View style={styles.infoBox}>
            <Text style={styles.componentName} numberOfLines={1}>
              {'<'}{componentInfo.name}{'>'}
            </Text>
            {componentInfo.codeInfo && (
              <Text style={styles.filePath} numberOfLines={1}>
                {componentInfo.codeInfo.relativePath}:
                {componentInfo.codeInfo.lineNumber}
              </Text>
            )}
            <Text style={styles.tapHint}>
              Tap to open in editor
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

function calculateInfoPosition(frame: {
  x: number;
  y: number;
  width: number;
  height: number;
}): { x: number; y: number } {
  const INFO_WIDTH = 250;
  const INFO_HEIGHT = 80;
  const PADDING = 10;

  let x = frame.x;
  let y = frame.y + frame.height + PADDING;

  // If tooltip would go off the right edge, align to right
  if (x + INFO_WIDTH > SCREEN_WIDTH - PADDING) {
    x = SCREEN_WIDTH - INFO_WIDTH - PADDING;
  }

  // If x is negative, align to left
  if (x < PADDING) {
    x = PADDING;
  }

  // If tooltip would go off the bottom, show above the element
  if (y + INFO_HEIGHT > SCREEN_HEIGHT - PADDING) {
    y = frame.y - INFO_HEIGHT - PADDING;
  }

  // If y is negative, show at top
  if (y < PADDING) {
    y = PADDING;
  }

  return { x, y };
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
  },
  highlightBox: {
    position: 'absolute',
    backgroundColor: 'rgba(135, 206, 235, 0.3)',
  },
  highlightBorder: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#0088ff',
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  infoContainer: {
    position: 'absolute',
    width: 250,
  },
  infoBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  componentName: {
    color: '#61dafb',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
    }),
  },
  filePath: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 4,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
    }),
  },
  tapHint: {
    color: '#666',
    fontSize: 10,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
