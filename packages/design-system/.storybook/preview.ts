import type { Preview } from '@storybook/react';
import { RodistaaTheme } from '../src/tokens';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: RodistaaTheme.colors.background.default,
        },
        {
          name: 'dark',
          value: RodistaaTheme.colors.background.dark,
        },
        {
          name: 'paper',
          value: RodistaaTheme.colors.background.paper,
        },
      ],
    },
    docs: {
      toc: true,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '24px', fontFamily: RodistaaTheme.typography.body.fontFamily }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;

