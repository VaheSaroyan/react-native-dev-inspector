---
sidebar_position: 1
---

# Installation

React Native Dev Inspector consists of several packages that work together:

| Package | Required | Description |
|---------|----------|-------------|
| `react-native-dev-inspector` | yes | Main package - the Inspector component, plus the Metro plugin at `/metro` |
| `@rn-dev-inspector/babel-plugin` | yes | Injects source locations into JSX at build time |
| `@rn-dev-inspector/core` | (transitive) | Core Inspector component and utilities |
| `@rn-dev-inspector/metro-plugin` | (transitive) | Server middleware for launching your editor |
| `@rn-dev-inspector/expo-plugin` | no | Optional `expo prebuild` setup helper |

:::info The babel plugin is required
React 19 removed the `_source` metadata that earlier versions attached to
elements, so on React 19 / React Native 0.78+ the babel plugin is the only
thing that can tell the inspector where a component comes from. Without it the
panel opens but shows "No source info available".
:::

## Choose Your Setup

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="expo" label="Expo" default>

```bash
npx expo install react-native-dev-inspector
npm install --save-dev @rn-dev-inspector/babel-plugin

# optional prebuild setup helper
npm install --save-dev @rn-dev-inspector/expo-plugin
```

Then follow the [Expo Setup](/docs/getting-started/expo-setup) guide.

  </TabItem>
  <TabItem value="bare" label="Bare React Native">

```bash
npm install react-native-dev-inspector
npm install --save-dev @rn-dev-inspector/babel-plugin
```

Then follow the [Bare React Native](/docs/getting-started/bare-react-native) guide.

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```bash
yarn add react-native-dev-inspector
yarn add --dev @rn-dev-inspector/babel-plugin
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```bash
pnpm add react-native-dev-inspector
pnpm add -D @rn-dev-inspector/babel-plugin
```

  </TabItem>
</Tabs>

## Requirements

- React Native 0.68+
- React 17+
- Node.js 18+

## TypeScript Support

All packages include TypeScript type definitions out of the box. No additional `@types/*` packages needed.
