import React from 'react';
import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    darkMode: {
      dark: { ...themes.dark },
      light: { ...themes.light },
      current: 'light',
    },
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'twitter', value: '#00aced' },
        { name: 'facebook', value: '#3b5998' },
      ],
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
}; 