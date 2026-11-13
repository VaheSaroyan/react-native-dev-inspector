/**
 * Expo config plugin for React Native Dev Inspector
 * Automatically configures babel and metro for the inspector
 */

import {
  ConfigPlugin,
  withDangerousMod,
  createRunOncePlugin,
} from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

export interface ExpoPluginOptions {
  /** Editor command to use */
  editor?: string;
  /** Whether to add babel plugin automatically */
  configureBabel?: boolean;
  /** File patterns to exclude from the babel plugin */
  excludes?: (string | RegExp)[];
}

const pkg = require('../package.json');

/**
 * Expo config plugin for React Native Dev Inspector
 *
 * @example
 * ```json
 * // app.json
 * {
 *   "expo": {
 *     "plugins": [
 *       ["@rn-dev-inspector/expo-plugin", { "editor": "code" }]
 *     ]
 *   }
 * }
 * ```
 */
const withDevInspector: ConfigPlugin<ExpoPluginOptions | void> = (
  config,
  options = {}
) => {
  const {
    editor = 'code',
    configureBabel = true,
    excludes = [],
  } = options || {};

  // Add babel plugin configuration hint to metro config
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      if (configureBabel) {
        await ensureBabelConfig(projectRoot, excludes);
      }

      await ensureMetroConfig(projectRoot, editor);

      return config;
    },
  ]);

  return config;
};

/**
 * Ensure babel.config.js includes our plugin
 */
async function ensureBabelConfig(projectRoot: string, excludes: (string | RegExp)[]) {
  const babelConfigPath = path.join(projectRoot, 'babel.config.js');

  // Check if babel config exists
  if (!fs.existsSync(babelConfigPath)) {
    // Create a basic babel config with our plugin
    const babelConfig = `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Dev Inspector babel plugin
      ['@rn-dev-inspector/babel-plugin', {
        excludes: ${JSON.stringify(excludes.map(e => e.toString()))},
      }],
    ],
  };
};
`;
    fs.writeFileSync(babelConfigPath, babelConfig);
    return;
  }

  // Read existing config
  const content = fs.readFileSync(babelConfigPath, 'utf-8');

  // Check if our plugin is already configured
  if (content.includes('@rn-dev-inspector/babel-plugin')) {
    return;
  }

}

/**
 * Ensure metro.config.js includes our middleware
 */
async function ensureMetroConfig(projectRoot: string, editor: string) {
  const metroConfigPath = path.join(projectRoot, 'metro.config.js');

  // Check if metro config exists
  if (!fs.existsSync(metroConfigPath)) {
    // Create a basic metro config with our middleware
    const metroConfig = `const { getDefaultConfig } = require('expo/metro-config');
const { withInspector } = require('@rn-dev-inspector/metro-plugin');

const config = getDefaultConfig(__dirname);

module.exports = withInspector(config, {
  editor: '${editor}',
});
`;
    fs.writeFileSync(metroConfigPath, metroConfig);
    return;
  }

  // Read existing config
  const content = fs.readFileSync(metroConfigPath, 'utf-8');

  // Check if our middleware is already configured
  if (content.includes('@rn-dev-inspector/metro-plugin') || content.includes('withInspector')) {
    return;
  }

}

export default createRunOncePlugin(withDevInspector, pkg.name, pkg.version);

// Named exports
export { withDevInspector };
