const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ti.js',
    library: 'ti'
  },
  module: {
    rules: [
      {
        test: /\.pegjs$/i,
        loader: 'pegjs-loader'
      }
    ]
  }
}
