/**
 * Babel configuration for React Native Operator App
 * 
 * Note: This config is used by Metro bundler (for native builds)
 * For webpack (web builds), babel-loader uses inline options in webpack.config.js
 */

module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    plugins: [
      // React Native Web plugin for web builds
      'react-native-web',
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
};

