/**
 * Metro plugin for React Native Dev Inspector
 *
 * @example
 * ```js
 * // metro.config.js
 * const { getDefaultConfig } = require('expo/metro-config');
 * const { withInspector } = require('react-native-dev-inspector/metro');
 *
 * const config = getDefaultConfig(__dirname);
 *
 * module.exports = withInspector(config, {
 *   editor: 'code', // 'code' | 'cursor' | 'webstorm' | etc.
 * });
 * ```
 *
 * @packageDocumentation
 */

// Re-export everything from metro-plugin
export * from '@rn-dev-inspector/metro-plugin';
