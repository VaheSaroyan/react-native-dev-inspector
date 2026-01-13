# NativeWind + React Native Dev Inspector Example

This example demonstrates how to use React Native Dev Inspector with NativeWind (Tailwind CSS for React Native) in an Expo project.

## Features

- Expo Router with tab navigation
- NativeWind v4 for Tailwind CSS styling
- React Native Dev Inspector for component inspection
- Babel plugin for precise source tracking

## Getting Started

### Prerequisites

- Node.js 18+
- iOS Simulator or Android Emulator
- Expo CLI

### Installation

```bash
# From the monorepo root
pnpm install

# Or from this directory
npm install
```

### Running the App

```bash
# Start Expo
npx expo start

# iOS
npx expo start --ios

# Android
npx expo start --android
```

## Project Structure

```
nativewind-usage/
├── app/
│   ├── _layout.tsx      # Root layout with Inspector wrapper
│   ├── index.tsx        # Home screen
│   ├── profile.tsx      # Profile screen
│   └── components.tsx   # Components showcase
├── babel.config.js      # Babel config with inspector plugin
├── metro.config.js      # Metro config with NativeWind + Inspector
├── tailwind.config.js   # Tailwind configuration
├── global.css           # Global CSS with Tailwind directives
└── package.json
```

## Key Configuration Files

### metro.config.js

Combines NativeWind and Inspector middleware:

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { withInspector } = require('react-native-dev-inspector/metro');

const config = getDefaultConfig(__dirname);

// Apply NativeWind first, then Inspector
const nativeWindConfig = withNativeWind(config, { input: './global.css' });
module.exports = withInspector(nativeWindConfig);
```

### babel.config.js

Includes the inspector babel plugin for precise source tracking:

```js
const { inspectorBabelPlugin } = require('react-native-dev-inspector/metro');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      inspectorBabelPlugin,
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```

### app/_layout.tsx

Wraps the app with the Inspector component:

```tsx
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';

export default function RootLayout() {
  return (
    <Inspector>
      <Stack />
      <InspectorDevMenu position="bottom-right" />
    </Inspector>
  );
}
```

## Using the Inspector

1. **Toggle Inspector**: Tap the floating button in the bottom-right corner, or shake the device to open the dev menu and select "Toggle Dev Inspector"

2. **Inspect Elements**: When the inspector is active, tap on any component to see:
   - Component hierarchy (breadcrumb navigation)
   - Source file location
   - Computed styles
   - Box model (margin, padding, dimensions)

3. **Open in Editor**: Tap the "Open" button to jump directly to the source code in your IDE

## NativeWind Styling

This example uses NativeWind v4 with the `className` prop for styling:

```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-2xl font-bold text-gray-900">
    Hello, NativeWind!
  </Text>
</View>
```

The inspector correctly displays these Tailwind styles in the style panel.

## Troubleshooting

### Inspector not showing source info

1. Make sure the babel plugin is configured in `babel.config.js`
2. Clear the Metro cache: `npx expo start --clear`
3. Reload the app completely

### NativeWind styles not applying

1. Ensure `global.css` is imported in your app
2. Check that `nativewind/babel` preset is in `babel.config.js`
3. Verify `tailwind.config.js` includes all your source files

### Editor not opening

1. Set `REACT_EDITOR` environment variable: `export REACT_EDITOR=code`
2. Make sure your editor command is in PATH
3. Check Metro console for error messages

## License

MIT
