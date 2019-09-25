const path = require('path')
const merge = require('webpack-merge')
const common = require(path.resolve(__dirname, 'webpack.config.js'))

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map'
})
