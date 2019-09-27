const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ti.js',
    library: 'ti'
  },
  // resolveLoader: {
  //   alias: {
  //     // 'pegjs-loader': path.join(__dirname, 'src', 'pegjs-loader.js')
  //     'pegjs-loader': path.join(__dirname, '../pegjs-loader/lib/index.js')
  //   }
  // },
  module: {
    rules: [
      {
        test: /\.pegjs$/i,
        // loader: 'raw-loader'
        // loader: 'pegjs-loader?format=commonjs'
        loader: 'pegjs-loader'
      }
    ]
  }
}
