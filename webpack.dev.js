const path = require('path')
const { merge } = require('webpack-merge')
const common = require(path.resolve(__dirname, 'webpack.config.js'))

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: path.resolve(__dirname, 'web'),
    port: 9080
  }
})
