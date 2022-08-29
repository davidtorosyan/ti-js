const path = require('path')
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')

const appRoot = path.resolve(__dirname, '..')

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
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'config/tsconfig.json',
          },
        },
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
    path: path.resolve(appRoot, 'dist/web'),
    filename: 'ti.js',
  },
})

const node = merge(common, {
  target: 'node',
  entry: './src/node.ts',
  output: {
    path: path.resolve(appRoot, 'dist/node'),
    filename: 'ti.js',
  },
  externals: [nodeExternals()],
})

module.exports = {
  builds: new Map([
    ['web', web],
    ['node', node],
  ]),
  options: {
    appRoot,
  },
}
