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

// rn-compat runtime patches (runtime API gaps on older RN, e.g. RN 0.72's
// URLSearchParams missing set()). Imported for side effects; feature-detected
// and a no-op on newer environments.
// Note the deep dist/runtime path: Metro before 0.79 does not support
// package.json exports, and the subpath export
// '@rn-dev-inspector/rn-compat/runtime' fails to resolve on older Metro.
import '@rn-dev-inspector/rn-compat/dist/runtime';

// Re-export everything from core
export * from '@rn-dev-inspector/core';

// Default export is the Inspector component
export { Inspector as default } from '@rn-dev-inspector/core';
