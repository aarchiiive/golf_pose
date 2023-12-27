// webpack.config.js

const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js', // 번들 파일 이름
    path: path.resolve(__dirname, 'dist'), // 번들 파일 경로
  },
  
  test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
  exclude: /node_modules/,
  use: ['file-loader?name=[name].[ext]'], // ?name=[name].[ext] is only necessary to preserve the original file name

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: './index.html',
      favicon: './public/favicon.ico'
    })
  ],
};
