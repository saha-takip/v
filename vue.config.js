const path = require('path');
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/frontend/' : '/',
  transpileDependencies: [
    '@supabase',
    'iceberg-js'
  ],
  chainWebpack: config => {
    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .include
      .add(/node_modules/)
      .end()
      .type('javascript/auto');
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [
            path.resolve(__dirname, 'node_modules/@supabase'),
            path.resolve(__dirname, 'node_modules/iceberg-js')
          ]
        }
      ]
    }
  }
}