/**
 * React Native Dev Inspector
 *
 * Click on React Native components to jump to source code in your IDE.
 *
 * @example
 * ```tsx
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
 * @packageDocumentation
 */

// Re-export everything from core
export * from '@rn-dev-inspector/core';

// Default export is the Inspector component
export { Inspector as default } from '@rn-dev-inspector/core';
