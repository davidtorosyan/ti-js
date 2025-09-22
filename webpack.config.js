const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const packageJson = require('./package.json')

const common = {
  mode: 'development',
  output: {
    library: {
      name: 'ti',
      type: 'umd',
    },
    clean: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
      'process.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\.peggy$/i,
        loader: 'peggy-loader',
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
