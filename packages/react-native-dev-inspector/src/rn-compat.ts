/**
 * React Native version compatibility layer.
 *
 * Wraps the Metro resolver so the inspector works across RN versions
 * (0.73–0.81 Fabric hierarchy fix, 0.82+ private path interception,
 * 0.86 hierarchy rebuild). See packages/rn-compat/src/index.ts.
 *
 * @example
 * ```js
 * // metro.config.js
 * const { withInspector } = require('react-native-dev-inspector/metro');
 * const { withInspectorCompat } = require('react-native-dev-inspector/rn-compat');
 *
 * module.exports = withInspector(withInspectorCompat(getDefaultConfig(__dirname)));
 * ```
 *
 * @packageDocumentation
 */

export { withInspectorCompat, default } from '@rn-dev-inspector/rn-compat';
