const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
// In your app, use: require('react-native-dev-inspector/metro')
const { withInspector } = require('react-native-dev-inspector/metro');
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

// Apply NativeWind configuration
const nativeWindConfig = withNativeWind(config, {
  input: './global.css',
});

// Add inspector middleware
module.exports = withInspector(nativeWindConfig, {
  cwd: projectRoot,
});
