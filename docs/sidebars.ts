import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/expo-setup',
        'getting-started/bare-react-native',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/editor-setup',
        'configuration/metro-plugin',
        'configuration/babel-plugin',
      ],
    },
    {
      type: 'category',
      label: 'Usage',
      items: [
        'usage/basic-usage',
        'usage/inspector-component',
        'usage/dev-menu',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/inspector',
        'api/hooks',
        'api/editor',
        'api/fiber-utils',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/editor-not-opening',
      ],
    },
  ],
};

export default sidebars;
