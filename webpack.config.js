const path = require('path')
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const tspegjs = require('ts-pegjs')

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
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\.peggy$/i,
        use: [
          'ts-loader',
          {
            loader: '@rocket.chat/peggy-loader',
            options: {
              plugins: [tspegjs],
              tspegjs: {
                customHeader: [
                  "import * as types from '../common/types'",
                  "import * as util from './pegutil'",
                ].join('\n'),
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
}

const web = merge(common, {
  target: 'web',
  entry: './src/web.ts',
  output: {
    path: path.resolve(__dirname, 'dist/web'),
    filename: 'ti.js',
  },
})

const node = merge(common, {
  target: 'node',
  entry: './src/node.ts',
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
