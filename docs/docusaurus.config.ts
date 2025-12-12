import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'React Native Dev Inspector',
  tagline: 'Click on any component to jump to its source code in your IDE',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://vahesaroyan.github.io',
  baseUrl: '/react-native-dev-inspector/',

  organizationName: 'VaheSaroyan',
  projectName: 'react-native-dev-inspector',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/VaheSaroyan/react-native-devtools/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'React Native Dev Inspector',
      logo: {
        alt: 'React Native Dev Inspector Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/VaheSaroyan/react-native-dev-inspector',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/installation',
            },
            {
              label: 'Configuration',
              to: '/docs/configuration/editor-setup',
            },
            {
              label: 'API Reference',
              to: '/docs/api/inspector',
            },
          ],
        },
        {
          title: 'Packages',
          items: [
            {
              label: 'react-native-dev-inspector',
              href: 'https://www.npmjs.com/package/react-native-dev-inspector',
            },
            {
              label: '@rn-dev-inspector/core',
              href: 'https://www.npmjs.com/package/@rn-dev-inspector/core',
            },
            {
              label: '@rn-dev-inspector/metro-plugin',
              href: 'https://www.npmjs.com/package/@rn-dev-inspector/metro-plugin',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/VaheSaroyan/react-native-dev-inspector',
            },
            {
              label: 'Issues',
              href: 'https://github.com/VaheSaroyan/react-native-dev-inspector/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} React Native Dev Inspector. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'jsx', 'tsx'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
