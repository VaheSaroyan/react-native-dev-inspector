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

3. **Rebuild after adding plugins**
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

## Source Info Not Found

### Symptoms
- Tapping shows "Unknown" or no file path
- Editor doesn't open

### Solutions

1. **Verify babel plugin is configured**
   ```js title="babel.config.js"
   module.exports = {
     plugins: ['@rn-dev-inspector/babel-plugin'],
   };
   ```

2. **Clear Metro cache**
   ```bash
   npx react-native start --reset-cache
   # or
   npx expo start --clear
   ```

3. **Check file exclusions**

   The file might be excluded. Check your babel plugin config:
   ```js
   ['@rn-dev-inspector/babel-plugin', {
     excludes: [/node_modules/],  // Make sure your files aren't excluded
   }]
   ```

## Wrong Component Selected

### Symptoms
- Tapping selects parent instead of child
- Selection seems off

### Solutions

1. **Tap more precisely** - The inspector finds the deepest component at the tap location

2. **Check for Pressable wrappers** - Some components are wrapped in touchable areas that intercept taps

3. **Use the native inspector** - React Native's built-in inspector (`Cmd+D` > "Show Element Inspector") may work better for some cases

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

3. **Physical devices and Android emulators**

   You normally don't need to set `devServerUrl` at all: the inspector reads the
   host that actually served the JS bundle, which is correct for simulators,
   emulators, physical devices on your LAN, and tunnels alike.

   Set it explicitly only to override that, for example when the dev server is
   reachable at a different address from the device:
   ```tsx
   <Inspector devServerUrl="http://192.168.1.20:8081">
     <App />
   </Inspector>
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

Expo Go doesn't include our native modules. The babel plugin works, but Metro middleware isn't available.

### Solution

Use development builds:
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

   Requires React Native 0.70+

3. **Report bugs**

   If you encounter Fabric-specific issues, please [open an issue](https://github.com/anthropics/react-native-dev-inspector/issues).
