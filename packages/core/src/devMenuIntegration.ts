/**
 * Dev Menu Integration for React Native and Expo
 * Adds "Toggle Inspector" to the development menu
 *
 * Works with:
 * - React Native CLI: Shake or Cmd+D (iOS) / Cmd+M (Android)
 * - Expo Dev Client: Shake or three-finger long press
 * - Expo Go: Shake gesture
 */

import { DevSettings, Platform } from 'react-native';

let isRegistered = false;
let toggleCallback: (() => void) | null = null;

/**
 * Register the inspector toggle in the dev menu
 * Call this once when the Inspector component mounts
 */
export function registerDevMenuToggle(onToggle: () => void): void {
  if (!__DEV__) return;

  toggleCallback = onToggle;

  if (isRegistered) return;
  isRegistered = true;

  // Method 1: React Native DevSettings (works in RN CLI and Expo)
  registerWithDevSettings(onToggle);

  // Method 2: Expo Dev Menu (if expo-dev-menu is available). When the
  // rn-compat Metro resolver is in use it maps the optional peer to an
  // empty module for projects without expo, so the requires below degrade
  // to no-ops instead of runtime-throwing stubs.
  registerWithExpoDevMenu(onToggle);
}

/**
 * Register the inspector toggle in the Expo Dev Menu (expo-dev-menu /
 * expo-dev-client). Optional explicit entry point — the automatic path in
 * registerDevMenuToggle already calls it; only use this to register on a
 * custom callback or when bypassing registerDevMenuToggle.
 */
export function registerExpoDevMenuToggle(onToggle?: () => void): void {
  if (!__DEV__) return;
  registerWithExpoDevMenu(onToggle ?? (() => { toggleCallback?.(); }));
}

/**
 * Update the toggle callback (when component re-renders)
 */
export function updateDevMenuCallback(onToggle: () => void): void {
  toggleCallback = onToggle;
}

/**
 * Register with React Native's DevSettings
 */
function registerWithDevSettings(onToggle: () => void): void {
  try {
    if (DevSettings && typeof DevSettings.addMenuItem === 'function') {
      DevSettings.addMenuItem('Toggle Dev Inspector', () => {
        toggleCallback?.();
      });
    }
  } catch (error) {
    // DevSettings not available (might be production build)
  }
}

/**
 * Register with Expo's Dev Menu (expo-dev-menu package)
 * This provides a better UX in Expo projects with dev-client
 *
 * Both packages are optional peers: expo-dev-client re-exports everything
 * from expo-dev-menu, so try either. Silently skip when neither is
 * installed or the native module is unavailable (bare RN CLI projects).
 */
function registerWithExpoDevMenu(onToggle: () => void): void {
  try {
    let expoDevMenu: {
      registerDevMenuItems?: (items: Array<{
        name: string;
        callback: () => void;
        shouldCollapse?: boolean;
      }>) => Promise<void>;
    } | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      expoDevMenu = require('expo-dev-menu');
    } catch {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        expoDevMenu = require('expo-dev-client');
      } catch {
        return;
      }
    }
    if (expoDevMenu && typeof expoDevMenu.registerDevMenuItems === 'function') {
      // Note: registerDevMenuItems REPLACES all registered items. That is
      // safe here because registerDevMenuToggle guards with isRegistered
      // and only ever calls this once.
      Promise.resolve(
        expoDevMenu.registerDevMenuItems([
          {
            name: 'Toggle Dev Inspector',
            callback: () => {
              onToggle?.();
            },
            shouldCollapse: true,
          },
        ])
      ).catch(() => {
        // native module unavailable (not running in a dev client)
      });
    }
  } catch (error) {
    // expo-dev-menu not installed
  }
}

/**
 * Check if dev menu is available
 */
export function isDevMenuAvailable(): boolean {
  if (!__DEV__) return false;

  try {
    // Check DevSettings
    if (DevSettings && typeof DevSettings.addMenuItem === 'function') {
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

/**
 * Instructions for opening dev menu on different platforms
 */
export function getDevMenuInstructions(): string {
  if (Platform.OS === 'ios') {
    return 'Shake device or press Cmd+D to open dev menu, then tap "Toggle Inspector"';
  } else if (Platform.OS === 'android') {
    return 'Shake device or press Cmd+M to open dev menu, then tap "Toggle Inspector"';
  }
  return 'Shake device to open dev menu, then tap "Toggle Inspector"';
}
