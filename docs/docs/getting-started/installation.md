---
sidebar_position: 1
---

# Installation

React Native Dev Inspector is a single package that includes everything you need.

## Install

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="npm" label="npm" default>

```bash
npm install react-native-dev-inspector
```

  </TabItem>
  <TabItem value="yarn" label="yarn">

```bash
yarn add react-native-dev-inspector
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```bash
pnpm add react-native-dev-inspector
```

  </TabItem>
  <TabItem value="expo" label="Expo">

```bash
npx expo install react-native-dev-inspector
```

  </TabItem>
</Tabs>

**That's it!** Just one package. No babel plugin required.

## Setup

### 1. Configure Metro

Add the inspector middleware to your `metro.config.js`:

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
// or: const { getDefaultConfig } = require('@react-native/metro-config');

const { withInspector } = require('react-native-dev-inspector/metro');

const config = getDefaultConfig(__dirname);

module.exports = withInspector(config, {
  editor: 'code', // optional - auto-detects if not specified
});
```

### 2. Wrap Your App

```tsx
// App.tsx or _layout.tsx (Expo Router)
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';

export default function App() {
  return (
    <Inspector>
      <YourApp />
      {/* Optional: floating button to toggle inspector */}
      <InspectorDevMenu position="bottom-right" />
    </Inspector>
  );
}
```

**Done!** Start your app and shake to access the dev menu, or tap the floating button.

## Requirements

- React Native 0.68+
- React 17+
- Node.js 18+
- Metro bundler

## TypeScript Support

TypeScript type definitions are included out of the box. No additional `@types/*` packages needed.

## Next Steps

- [Configure your editor](/docs/configuration/editor-setup)
- [Customize the inspector](/docs/api/inspector)
- [Troubleshooting](/docs/troubleshooting/common-issues)
