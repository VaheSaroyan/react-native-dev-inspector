/**
 * @rn-dev-inspector/rn-compat
 *
 * React Native version compatibility layer. One-line integration in
 * metro.config.js:
 *
 *   const { withInspector } = require('react-native-dev-inspector/metro');
 *   const { withInspectorCompat } = require('@rn-dev-inspector/rn-compat');
 *   module.exports = withInspector(withInspectorCompat(getDefaultConfig(__dirname)));
 *
 * Adaptation matrix:
 *   RN <= 0.72 (Paper)      : fix Metro optional-dependency mis-resolution +
 *                             rebuild hierarchy by looking the host fiber up
 *                             via touchedViewTag (wrapper components that do
 *                             not forward props, like Button, also resolve to
 *                             the business JSX line)
 *   RN 0.73-0.81 (Fabric)   : fix optional-dependency mis-resolution + restore
 *                             hierarchy fibers + find source in subtree
 *   RN 0.82+                : intercept the new private path -> shim rebuilds
 *                             the hierarchy (verified on 0.86)
 *
 * The shim refers back to the current RN's real getInspectorDataForViewAtPoint
 * implementation through the marker module name
 * `__rn_dev_inspector_original_impl__`; the marker name is resolved to an
 * absolute path at config time, so the shim is decoupled from the project's
 * location (the shim file is not on the project's node_modules chain — a bare
 * module name would fail to resolve).
 */

import * as fs from 'fs';
import * as path from 'path';

// New private path on RN 0.82+, which Inspector.js requires first
const PRIVATE_082 =
  'react-native/src/private/devsupport/devmenu/elementinspector/getInspectorDataForViewAtPoint';

// Public path on RN <= 0.80, required by core on Paper projects (e.g. 0.72).
// Intercepted to the shim so Paper can rebuild the hierarchy too (the shim
// comes back to this file via MARKER).
const PUBLIC_LE080 = 'react-native/Libraries/Inspector/getInspectorDataForViewAtPoint';

// The shim requires the real implementation through this marker name; the
// adapter resolves it to an absolute path at config time
const MARKER = '__rn_dev_inspector_original_impl__';

// Optional peers: resolve to an empty module when not installed so core's
// try/catch degrades gracefully (otherwise Metro generates a stub that throws
// at runtime and dev reports "Requiring unknown module")
const OPTIONAL_PEERS = ['expo-dev-menu', 'expo-dev-client'];

interface WithInspectorCompatOptions {
  /** App root directory; defaults to config.projectRoot or process.cwd() */
  root?: string;
}

type MetroResolver = (
  context: any,
  moduleName: string,
  platform: string | null
) => { type: string; filePath: string } | any;

interface MetroConfigLike {
  projectRoot?: string;
  watchFolders?: string[];
  resolver?: {
    resolveRequest?: MetroResolver;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Probe the project's react-native for the real getInspectorDataForViewAtPoint
 * implementation, by priority:
 *   0.81+ : src/private/devsupport/devmenu/elementinspector/...
 *   <=0.80: Libraries/Inspector/...
 */
function findRealImpl(root: string): string | null {
  const candidates = [
    'node_modules/react-native/src/private/devsupport/devmenu/elementinspector/getInspectorDataForViewAtPoint.js',
    'node_modules/react-native/Libraries/Inspector/getInspectorDataForViewAtPoint.js',
  ];
  for (const rel of candidates) {
    const p = path.join(root, rel);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Wrap the metro config:
 * - intercept the 0.82 private path -> bundled shim (the shim requires the
 *   real implementation internally)
 * - intercept the marker module name -> real implementation file
 * - all other requests continue with the original resolveRequest (if any)
 */
export function withInspectorCompat<T extends MetroConfigLike = MetroConfigLike>(
  config: T,
  options: WithInspectorCompatOptions = {}
): T {
  // Prefer Metro's projectRoot (in a monorepo the repo root is not the app
  // root; the real implementation must be found in the app's own node_modules)
  const root = options.root || config.projectRoot || process.cwd();
  const realImpl = findRealImpl(root);
  if (!realImpl) {
    throw new Error(
      '@rn-dev-inspector/rn-compat: could not find the react-native ' +
        'getInspectorDataForViewAtPoint implementation under ' +
        root +
        '; make sure root points to the project directory.'
    );
  }
  // After compilation this file lives in dist/; the shim is in the package
  // root's shims/ directory
  const shimPath = path.resolve(__dirname, '..', 'shims', 'inspectorDataShim.js');
  const emptyModulePath = path.resolve(__dirname, '..', 'shims', 'emptyModule.js');

  // Approximate Metro's resolution with Node's rules (config time, node side):
  // an expo package counts as "installed" only if resolvable from the project
  // (or the monorepo root)
  const isInstalled = (name: string): boolean => {
    try {
      require.resolve(`${name}/package.json`, { paths: [root] });
      return true;
    } catch {
      return false;
    }
  };
  const prev = (config.resolver && config.resolver.resolveRequest) || null;

  // Both the shim and the real implementation file must be within Metro's
  // watch scope to participate in bundling (in a monorepo the real
  // implementation may sit in the workspace root's node_modules).
  // Not needed when the react-native package is inside the project (Metro
  // 0.76's TreeFS throws "Could not add directory" because watchFolders
  // duplicates a directory already under the project root), and adding it is
  // actively harmful; only add it when the package lives outside the project
  // (monorepo).
  const pkgRoot = path.resolve(__dirname, '..');
  const implPkgRoot = realImpl.match(/^.*node_modules[\\/]react-native/);
  const implOutsideProject =
    implPkgRoot &&
    (() => {
      const rel = path.relative(root, implPkgRoot[0]);
      return !!rel && (rel.startsWith('..') || path.isAbsolute(rel));
    })();
  const extraWatch = [
    pkgRoot,
    ...(implOutsideProject ? [implPkgRoot![0]] : []),
  ];
  config.watchFolders = [
    ...new Set([...(config.watchFolders || []), ...extraWatch]),
  ];

  config.resolver = {
    ...(config.resolver || {}),
    resolveRequest(context, moduleName, platform) {
      if (moduleName === PRIVATE_082 || moduleName === PUBLIC_LE080) {
        return { type: 'sourceFile', filePath: shimPath };
      }
      if (moduleName === MARKER) {
        return { type: 'sourceFile', filePath: realImpl };
      }
      if (OPTIONAL_PEERS.includes(moduleName) && !isInstalled(moduleName)) {
        return { type: 'sourceFile', filePath: emptyModulePath };
      }
      if (prev) return prev(context, moduleName, platform);
      return context.resolveRequest(context, moduleName, platform);
    },
  };
  return config;
}

export default withInspectorCompat;
