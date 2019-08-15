const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const WebpackMd5Hash = require('webpack-md5-hash');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {src_Path, distDir, copyPluginConfig} = require('./common.js');

module.exports = {
  entry: {
    main: src_Path + '/scripts/app.js'
  },
  output: {
    path: distDir,
    filename: '[name].[chunkhash:8].js',
    chunkFilename: '[name].[chunkhash:8].js',
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        test: /\.(sass|scss|css)$/,
        use: [{
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
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
            loader: 'sass-loader'
          }
        ]
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
        test: /\.(handlebars|hbs)$/, loader: 'handlebars-loader'
      }
    ]
  },
  optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
					chunks: 'all',
				},
				chunks: 'all'
			}
		}
	},
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './index.ejs',
      filename: 'index.html'
    }),
    new CopyPlugin(copyPluginConfig),
    // new WebpackMd5Hash()
  ]
};
