const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native': 'react-native-web',
      'react': path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-dev-runtime'),
      // Fix styleq import - react-native-web expects this export but styleq doesn't provide it
      'styleq/transform-localize-style': path.resolve(__dirname, 'src/utils/styleq-transform-stub.js'),
      '@rodistaa/design-system': path.resolve(__dirname, '../../design-system/src'),
      '@rodistaa/app-shared': path.resolve(__dirname, '../../app-shared/src'),
      '@rodistaa/mobile-shared': path.resolve(__dirname, '../shared/src'),
      // Mock optional dependencies that may not be installed
      'react-native-reanimated': path.resolve(__dirname, 'src/utils/reanimated-stub.js'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.json', '.mjs'],
    modules: [
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../packages/mobile/operator/node_modules'),
      'node_modules',
      path.resolve(__dirname, '../../design-system/src'),
      path.resolve(__dirname, '../../app-shared/src'),
      path.resolve(__dirname, '../shared/src'),
    ],
    fallback: {
      // Node.js polyfills for browser
      'events': require.resolve('events'),
      'stream': false,
      'crypto': false,
      'util': false,
      'buffer': false,
      'process': false,
      // Provide empty fallbacks for optional native modules
      'react-native-reanimated': false,
    },
    symlinks: false,
    fullySpecified: false, // Allow imports without file extensions
    mainFields: ['browser', 'module', 'main'], // Prioritize browser builds for web
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: [
          // Only exclude node_modules that we don't need to transform
          /node_modules\/(?!(react|react-dom|react-native|react-native-web|@rodistaa|@react-native|@react-navigation|@tanstack|use-sync-external-store|use-latest-callback)\/).*/,
          // Exclude design-system components directory for web builds (only use tokens)
          path.resolve(__dirname, '../../design-system/src/components'),
        ],
            use: {
          loader: 'babel-loader',
          options: {
            configFile: false,
            presets: [
              ['@babel/preset-env', { targets: { esmodules: true } }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
            plugins: [],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Rodistaa Operator',
    }),
    // Ignore optional dependencies warnings
    new webpack.IgnorePlugin({
      resourceRegExp: /^react-native-reanimated$/,
      contextRegExp: /react-native-gesture-handler/,
    }),
    // Define process.env for react-native-web
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    }),
  ],
  // Suppress warnings for optional dependencies
  ignoreWarnings: [
    {
      module: /react-native-gesture-handler/,
      message: /react-native-reanimated/,
    },
  ],
  devServer: {
    port: 3002,
    historyApiFallback: true,
    hot: true,
    open: true,
  },
};

