module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Injects source location info for the "Open in Editor" feature.
      // Must come before reanimated's plugin, which has to stay last.
      '@rn-dev-inspector/babel-plugin',
      'react-native-reanimated/plugin',
    ],
  };
};
