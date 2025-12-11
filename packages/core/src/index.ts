/**
 * React Native Dev Inspector
 * Click on components to jump to source code in your IDE
 */

// Main Inspector component
export { Inspector, useInspector, toggleInspectorGlobal } from './Inspector';
export type { InspectorProps } from './Inspector';

// Overlay component
export { Overlay } from './Overlay';
export type { OverlayProps } from './Overlay';

// Fiber utilities
export {
  getFiberFromInstance,
  findNearestFiberWithSource,
  findNearestUserComponentWithSource,
  findFirstUserComponentWithSource,
  getFiberName,
  getCodeInfoFromFiber,
  isUserComponent,
  isHostComponent,
  getFiberStack,
  findAllSourceComponents,
  getRootFiber,
} from './fiber';
export type { Fiber, DebugSource, CodeInfo, InspectInfo } from './fiber';

// Editor launching
export {
  launchEditor,
  launchEditorViaInspector,
  launchEditorViaMetro,
  launchEditorViaUrlScheme,
  checkDevServer,
} from './editor';
export type { LaunchEditorOptions } from './editor';

// DevMenu integration
export { InspectorDevMenu, InspectorButton } from './DevMenu';
export type { InspectorDevMenuProps, InspectorButtonProps } from './DevMenu';

// Dev menu integration utilities
export { registerDevMenuToggle, isDevMenuAvailable, getDevMenuInstructions } from './devMenuIntegration';

// Touch Inspector (alternative implementation)
export { TouchInspector } from './TouchInspector';
export type { TouchInspectorRef } from './TouchInspector';

// View traversal utilities
export {
  measureView,
  isPointInFrame,
  getReactInternalKey,
  getViewHierarchy,
  findTouchableAreas,
} from './utils/viewTraversal';
export type { ViewFrame, TouchPoint } from './utils/viewTraversal';
