const fs = require('fs');
const path = require('path');
const os = require("os");
const userHomeDir = os.homedir();
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const CopyPlugin = require('copy-webpack-plugin');
const {src_Path, distDir, copyPluginConfig, splitChunksConfig} = require('./common.js');

module.exports = {
  entry: {
    main: src_Path + '/scripts/app.js'
  },
  output: {
    filename: '[name].[chunkhash:8].js',
    chunkFilename: '[name].[chunkhash:8].js',
    path: distDir,
  },
  devtool: 'source-map',
  devServer: {
    https: true,
    key : fs.readFileSync(path.join(userHomeDir, '/cert/CA/localhost/localhost.decrypted.key')),
    cert : fs.readFileSync(path.join(userHomeDir, '/cert/CA/localhost/localhost.crt'))
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'img',
          },
        }],
      },
      {
        test: /\.(html|ejs)$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: false }
          }
        ]
      },
      {
        test: /\.(sass|scss|css)$/,
        exclude: /node_modules/,
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
              config: {
                path: './postcss.config.js'
              }
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(handlebars|hbs)$/, loader: 'handlebars-loader'
      }
    ]
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: splitChunksConfig
	},
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      hash: false,
      inject: true,
      template: './index.ejs',
      filename: 'index.html'
    }),
    new HtmlWebpackInlineSVGPlugin({
      runPreEmit: true,
    }),
    new CopyPlugin(copyPluginConfig),
    new WebpackMd5Hash()
  ]
};
