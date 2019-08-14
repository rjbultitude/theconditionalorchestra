const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const {src_Path, distDir, copyPluginConfig} = require('./common.js');

module.exports = {
  entry: {
    main: src_Path + '/scripts/app.js'
  },
  output: {
    path: distDir,
    filename: '[name].[chunkhash].js'
  },
  devtool: 'source-map',
  devServer: {
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.(sass|scss|css)$/,
        use: [{
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              modules: false,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          },
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [{
          loader: 'file-loader',
        }],
      },
      {
        test: /\.(handlebars|hbs)$/, loader: 'handlebars-loader'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'global.css',
    }),
    new HtmlWebpackPlugin({
      inject: false,
      hash: false,
      template: './index.ejs',
      filename: 'index.html'
    }),
    new CopyPlugin(copyPluginConfig),
  ]
};
