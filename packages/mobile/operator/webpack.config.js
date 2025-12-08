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
      '@rodistaa/design-system': path.resolve(__dirname, '../../design-system/src'),
      '@rodistaa/app-shared': path.resolve(__dirname, '../../app-shared/src'),
      '@rodistaa/mobile-shared': path.resolve(__dirname, '../shared/src'),
      // Mock optional dependencies that may not be installed
      'react-native-reanimated': path.resolve(__dirname, 'src/utils/reanimated-stub.js'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    modules: [
      'node_modules',
      path.resolve(__dirname, '../../design-system/src'),
      path.resolve(__dirname, '../../app-shared/src'),
      path.resolve(__dirname, '../shared/src'),
    ],
    fallback: {
      // Provide empty fallbacks for optional native modules
      'react-native-reanimated': false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: [
          /node_modules\/(?!(@rodistaa|react-native|@react-native)\/).*/,
          // Exclude design-system components directory for web builds (only use tokens)
          path.resolve(__dirname, '../../design-system/src/components'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            configFile: false, // Don't use babel.config.js
            presets: [
              ['@babel/preset-env', { targets: { esmodules: true } }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
            plugins: ['react-native-web'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
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

