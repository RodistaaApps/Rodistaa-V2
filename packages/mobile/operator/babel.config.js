/**
 * Babel configuration for React Native Operator App
 */

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // React Native Reanimated plugin must be listed last
    // Only include if react-native-reanimated is installed
    // 'react-native-reanimated/plugin',
  ],
  env: {
    production: {
      plugins: [
        // Production plugins if needed
      ],
    },
  },
};

