/**
 * Dev Menu integration components
 * Provides UI for toggling the inspector from within the app
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useInspector } from './Inspector';

export interface InspectorDevMenuProps {
  /** Position of the floating button */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Custom style for the button container */
  containerStyle?: object;
  /** Whether to show the button only when inspector is inactive */
  showOnlyWhenInactive?: boolean;
  /** Use minimal/compact style (smaller button) */
  compact?: boolean;
}

/**
 * Floating button to toggle the inspector
 * Add this component to your app for easy access to the inspector
 */
export const InspectorDevMenu: React.FC<InspectorDevMenuProps> = ({
  position = 'bottom-right',
  containerStyle,
  showOnlyWhenInactive = true,
  compact = true,
}) => {
  const { isInspecting, toggleInspector } = useInspector();

  if (!__DEV__) {
    return null;
  }

  if (showOnlyWhenInactive && isInspecting) {
    return null;
  }

  const positionStyle = getPositionStyle(position, compact);

  const handlePress = () => {
    toggleInspector();
  };

  return (
    <View style={[styles.container, positionStyle, containerStyle]} pointerEvents="box-none">
      <TouchableOpacity
        style={[
          compact ? styles.compactButton : styles.button,
          isInspecting && (compact ? styles.compactButtonActive : styles.buttonActive),
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={compact ? styles.compactButtonIcon : styles.buttonIcon}>
          {isInspecting ? '✕' : (compact ? '⚡' : '🔍')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export interface InspectorButtonProps {
  /** Custom style for the button */
  style?: object;
  /** Custom style for the text */
  textStyle?: object;
  /** Custom label */
  label?: string;
  /** Custom active label */
  activeLabel?: string;
  /** Custom render function */
  children?: (isInspecting: boolean, toggle: () => void) => React.ReactNode;
}

/**
 * Simple button to toggle the inspector
 * Use this when you want to integrate the toggle into your own UI
 */
export const InspectorButton: React.FC<InspectorButtonProps> = ({
  style,
  textStyle,
  label = 'Inspect',
  activeLabel = 'Stop Inspecting',
  children,
}) => {
  const { isInspecting, toggleInspector } = useInspector();

  if (!__DEV__) {
    return null;
  }

  if (children) {
    return <>{children(isInspecting, toggleInspector)}</>;
  }

  return (
    <TouchableOpacity
      style={[styles.textButton, style]}
      onPress={toggleInspector}
      activeOpacity={0.7}
    >
      <Text style={[styles.textButtonLabel, textStyle]}>
        {isInspecting ? activeLabel : label}
      </Text>
    </TouchableOpacity>
  );
};

function getPositionStyle(position: string, compact: boolean = false) {
  const offset = compact ? 8 : 16;
  const topOffset = compact ? 60 : 50;
  const bottomOffset = compact ? 100 : 50;

  switch (position) {
    case 'top-left':
      return { top: topOffset, left: offset };
    case 'top-right':
      return { top: topOffset, right: offset };
    case 'bottom-left':
      return { bottom: bottomOffset, left: offset };
    case 'bottom-right':
    default:
      return { bottom: bottomOffset, right: offset };
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999998,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonActive: {
    backgroundColor: '#0088ff',
  },
  buttonIcon: {
    fontSize: 24,
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  compactButtonActive: {
    backgroundColor: '#ff3b30',
  },
  compactButtonIcon: {
    fontSize: 16,
    color: '#fff',
  },
  textButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0088ff',
    borderRadius: 4,
  },
  textButtonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
