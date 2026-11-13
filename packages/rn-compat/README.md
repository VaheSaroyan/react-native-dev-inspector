# @rn-dev-inspector/rn-compat

React Native version compatibility layer for [React Native Dev Inspector](https://github.com/VaheSaroyan/react-native-dev-inspector).

A Metro resolver shim that keeps the inspector hierarchy working across React Native versions — the internal `getInspectorDataForViewAtPoint` module moved to a new private path on RN 0.82+, and its fiber contract differs between Paper (≤ 0.72) and Fabric (0.73+).

## Supported RN versions

| RN version | Architecture | Status | Notes |
| --- | --- | --- | --- |
| ≤ 0.72 | Paper | ✅ Supported | Rebuilds the hierarchy by looking the tapped host fiber up via `touchedViewTag`; wrapper components that don't forward props (e.g. `Button`) still resolve to the business JSX line |
| 0.73 – 0.81 | Fabric | ✅ Supported | Restores hierarchy fibers and finds source in the subtree |
| 0.82+ | Fabric | ✅ Supported | Intercepts the new private devsupport path; shim rebuilds the hierarchy (verified on 0.86) |

> **Compatibility caveat:** the layer intercepts react-native's *internal* module paths (`react-native/src/private/...`, `react-native/Libraries/Inspector/...`). These are not public API and can move in any release. When upgrading RN past the versions listed above, verify the inspector still works; if a path moved, the compat layer will log a warning and degrade to the stock inspector instead of breaking the bundler.

## Usage

```js
// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config');
const { withInspector } = require('react-native-dev-inspector/metro');
const { withInspectorCompat } = require('@rn-dev-inspector/rn-compat');

module.exports = withInspector(withInspectorCompat(getDefaultConfig(__dirname)));
```

`withInspectorCompat` never mutates the config you pass in (it returns a new object) and never throws at config load time: if the react-native implementation cannot be located it logs a warning and returns the config without the compat resolver, so the bundler keeps running.

Options:

- `root` — app root directory used to locate react-native; defaults to `config.projectRoot` or `process.cwd()`. In a monorepo the lookup walks up parent directories, so a hoisted react-native in the workspace root's `node_modules` is found automatically.

## How it works

1. **Interception** — the resolver redirects react-native's inspector module (both the legacy `Libraries/Inspector` path and the 0.82+ `src/private` path) to a bundled shim.
2. **Shim** — the shim requires the *real* implementation through the marker name `__rn_dev_inspector_original_impl__`, which the resolver maps back to the actual file in the project's react-native install (resolved to an absolute path at config time, since the shim is not on the project's node_modules chain).
3. **Polyfills** — `@rn-dev-inspector/rn-compat/runtime` (re-exported as `react-native-dev-inspector/rn-compat`) contains runtime fixes for Paper/Fabric differences.
4. **Watch folders** — the shim package (and the react-native package, when it lives outside the project, e.g. in a monorepo workspace root) is appended to `config.watchFolders` so it participates in bundling.
5. **Optional peers** — `expo-dev-menu` / `expo-dev-client` are resolved to an empty module when not installed, so Metro doesn't generate a stub that throws "Requiring unknown module" at runtime.
