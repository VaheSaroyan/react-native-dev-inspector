const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// In your app, use: require('react-native-dev-inspector/metro')
const { withInspector } = require('react-native-dev-inspector/metro');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Get default config
const defaultConfig = getDefaultConfig(__dirname);

// Configure for monorepo - allow Metro to resolve packages from parent directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = {
  // Watch only the packages directory to avoid issues with pnpm's .pnpm store
  watchFolders: [
    path.resolve(monorepoRoot, 'packages'),
  ],
  resolver: {
    // Only use local node_modules to avoid resolution conflicts
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
    ],
    // Enable symlinks for npm file: references
    unstable_enableSymlinks: true,
    // Disable package exports to ensure compatibility with linked packages
    unstable_enablePackageExports: false,
  },
};

// Merge configs and add inspector middleware
module.exports = withInspector(mergeConfig(defaultConfig, config), {
  cwd: projectRoot,
});
