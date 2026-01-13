// Import the inspector babel plugin
const { inspectorBabelPlugin } = require('react-native-dev-inspector/metro');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Inspector plugin - injects source location info for "Open in Editor" feature
      inspectorBabelPlugin,
      'react-native-reanimated/plugin',
    ],
  };
};
