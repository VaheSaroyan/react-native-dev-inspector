module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Dev Inspector babel plugin
      // This injects source location data into your JSX
      '@rn-dev-inspector/babel-plugin',
    ],
  };
};
