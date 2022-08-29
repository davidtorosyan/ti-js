const path = require('path')
const { merge } = require('webpack-merge')
const common = require(path.resolve(__dirname, 'webpack.config.js'))

module.exports = [...common.builds.values()].map(c => merge(c, {
  mode: 'production',
  devtool: 'source-map',
}))
