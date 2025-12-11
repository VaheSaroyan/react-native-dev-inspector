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

  // Method 2: Expo Dev Menu (if expo-dev-menu is available)
  registerWithExpoDevMenu(onToggle);
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
 */
function registerWithExpoDevMenu(_onToggle: () => void): void {
  // Disabled - expo-dev-menu requires explicit installation
  // and causes errors when not present
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
