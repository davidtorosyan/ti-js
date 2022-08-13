const path = require('path')
const { merge } = require('webpack-merge')
const common = require(path.resolve(__dirname, 'webpack.config.js'))

module.exports = [...common.values()].map(c => merge(c, {
  mode: 'development', // @nocommit
  devtool: 'source-map'
}))
