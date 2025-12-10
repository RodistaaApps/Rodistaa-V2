/**
 * Storybook Configuration
 */

module.exports = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-react-native-web',
  ],
  framework: {
    name: '@storybook/react-native',
    options: {},
  },
  reactNativeOptions: {
    strictMode: false,
  },
};

