const path = require('path')
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')

const common = {
  mode: 'development',
  output: {
    library: {
      name: 'ti',
      type: 'umd',
    },
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.peggy$/i,
        loader: 'peggy-loader',
      },
    ],
  },
}

const web = merge(common, {
  target: 'web',
  entry: './src/web.js',
  output: {
    path: path.resolve(__dirname, 'dist/web'),
    filename: 'ti.js',
  },
})

const node = merge(common, {
  target: 'node',
  entry: './src/node.js',
  output: {
    path: path.resolve(__dirname, 'dist/node'),
    filename: 'ti.js',
  },
  externals: [nodeExternals()],
})

module.exports = new Map([
  ['web', web],
  ['node', node],
])
