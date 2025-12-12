---
sidebar_position: 1
---

# Common Issues

Solutions to common problems you might encounter.

## Inspector Not Showing

### Symptoms
- The floating button doesn't appear
- Tapping components does nothing

### Solutions

1. **Ensure you're in development mode**
   ```tsx
   // The inspector only works when __DEV__ is true
   console.log('Dev mode:', __DEV__);
   ```

2. **Check component wrapping**
   ```tsx
   // Make sure Inspector wraps your entire app
   <Inspector>
     <App />  {/* App must be inside Inspector */}
     <InspectorDevMenu />
   </Inspector>
   ```

3. **Clear cache and restart**
   ```bash
   npx expo start --clear
   # or
   npx react-native start --reset-cache
   ```

## Source Info Not Found

### Symptoms
- Tapping shows "No source info available"
- Editor doesn't open

### Solutions

1. **Clear Metro cache**
   ```bash
   npx react-native start --reset-cache
   # or
   npx expo start --clear
   ```

2. **Some library components don't have source info**

   Third-party library components (from node_modules) typically don't include source location metadata. This is expected behavior.

3. **Verify Metro plugin is configured**
   ```js title="metro.config.js"
   const { withInspector } = require('react-native-dev-inspector/metro');
   module.exports = withInspector(config);
   ```

## Wrong Component Selected

### Symptoms
- Tapping selects parent instead of child
- Selection seems off

### Solutions

1. **Tap more precisely** - The inspector finds the deepest component at the tap location

2. **Check for Pressable wrappers** - Some components are wrapped in touchable areas that intercept taps

3. **Use the hierarchy breadcrumb** - You can navigate through parent components by tapping items in the breadcrumb

## Metro Connection Issues

### Symptoms
- "Failed to launch editor" errors
- Dev server not reachable

### Solutions

1. **Check Metro is running**
   ```bash
   npx expo start
   # or
   npx react-native start
   ```

2. **Verify correct port**
   ```tsx
   <Inspector devServerUrl="http://localhost:8081">
     <App />
   </Inspector>
   ```

3. **Android emulator specific**

   Android emulator uses `10.0.2.2` for localhost:
   ```tsx
   const devUrl = Platform.OS === 'android'
     ? 'http://10.0.2.2:8081'
     : 'http://localhost:8081';
   ```

## TypeScript Errors

### Symptoms
- Type errors when importing

### Solutions

All packages include TypeScript definitions. If you see type errors:

1. **Update packages**
   ```bash
   npm update react-native-dev-inspector
   ```

2. **Check TypeScript version**

   Requires TypeScript 4.7+

3. **Restart TypeScript server**

   In VS Code: `Cmd+Shift+P` > "TypeScript: Restart TS Server"

## Expo Go Limitations

### Symptoms
- Works in development builds but not Expo Go

### Why

Expo Go has limited support for custom Metro middleware.

### Solution

Use development builds for the best experience:
```bash
npx expo run:ios
# or
npx expo run:android
```

## New Architecture (Fabric) Issues

### Symptoms
- Inspector doesn't find components
- Crashes or errors in Fabric mode

### Solutions

The inspector supports Fabric, but some methods differ:

1. **Update to latest version**
   ```bash
   npm update react-native-dev-inspector
   ```

2. **Check React Native version**

   Requires React Native 0.68+

3. **Report bugs**

   If you encounter Fabric-specific issues, please [open an issue](https://github.com/VaheSaroyan/react-native-dev-inspector/issues).
