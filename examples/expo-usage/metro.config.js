const { getDefaultConfig } = require('expo/metro-config');
const { withInspector } = require('@rn-dev-inspector/metro-plugin');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch only the packages folder, not the entire monorepo
config.watchFolders = [
  path.resolve(monorepoRoot, 'packages'),
];

// Resolve packages from monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Ensure symlinks are followed
config.resolver.unstable_enableSymlinks = true;

// Add inspector middleware from the package
module.exports = withInspector(config, {
  // Editor will be auto-detected from REACT_EDITOR or EDITOR env vars
  // Or specify explicitly: editor: 'code', 'webstorm', 'cursor', etc.
  cwd: projectRoot,
});
