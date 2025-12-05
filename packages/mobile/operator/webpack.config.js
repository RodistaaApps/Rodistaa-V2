const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    modules: [
      'node_modules',
      path.resolve(__dirname, '../../design-system/src'),
      path.resolve(__dirname, '../../app-shared/src'),
      path.resolve(__dirname, '../shared/src'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules(?!\/@rodistaa)/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../../design-system/src'),
          path.resolve(__dirname, '../../app-shared/src'),
          path.resolve(__dirname, '../shared/src'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
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
  ],
  devServer: {
    port: 3002,
    historyApiFallback: true,
    hot: true,
    open: true,
  },
};

