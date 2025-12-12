/**
 * React Native Dev Inspector
 *
 * Click on React Native components to jump to source code in your IDE.
 *
 * @example
 * ```tsx
 * // App.tsx
 * import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';
 *
 * export default function App() {
 *   return (
 *     <Inspector>
 *       <YourApp />
 *       <InspectorDevMenu />
 *     </Inspector>
 *   );
 * }
 * ```
 *
 * @example
 * ```js
 * // metro.config.js
 * const { withInspector } = require('react-native-dev-inspector/metro');
 *
 * module.exports = withInspector(config, { editor: 'code' });
 * ```
 *
 * @packageDocumentation
 */

// Re-export everything from core
export * from '@rn-dev-inspector/core';

// Default export is the Inspector component
export { Inspector as default } from '@rn-dev-inspector/core';
