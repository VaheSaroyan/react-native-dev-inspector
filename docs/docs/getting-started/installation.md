---
sidebar_position: 1
---

# Installation

React Native Dev Inspector consists of several packages that work together:

| Package | Description |
|---------|-------------|
| `react-native-dev-inspector` | Main package - re-exports everything from core |
| `@rn-dev-inspector/core` | Core Inspector component and utilities |
| `@rn-dev-inspector/babel-plugin` | Injects source location into JSX |
| `@rn-dev-inspector/metro-plugin` | Server middleware for launching editor |
| `@rn-dev-inspector/expo-plugin` | Expo config plugin for automatic setup |

## Choose Your Setup

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="expo" label="Expo" default>

```bash
npx expo install react-native-dev-inspector @rn-dev-inspector/expo-plugin
```

Then follow the [Expo Setup](/docs/getting-started/expo-setup) guide.

  </TabItem>
  <TabItem value="bare" label="Bare React Native">

```bash
npm install react-native-dev-inspector @rn-dev-inspector/babel-plugin @rn-dev-inspector/metro-plugin
```

Then follow the [Bare React Native](/docs/getting-started/bare-react-native) guide.

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```bash
yarn add react-native-dev-inspector @rn-dev-inspector/babel-plugin @rn-dev-inspector/metro-plugin
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```bash
pnpm add react-native-dev-inspector @rn-dev-inspector/babel-plugin @rn-dev-inspector/metro-plugin
```

  </TabItem>
</Tabs>

## Requirements

- React Native 0.70+
- React 18+
- Node.js 18+

## TypeScript Support

All packages include TypeScript type definitions out of the box. No additional `@types/*` packages needed.
