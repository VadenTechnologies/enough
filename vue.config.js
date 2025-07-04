const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@vue/cli-plugin-babel/preset']
            }
          }
        }
      ]
    },
    devtool: 'source-map'
  },
  lintOnSave: false
}) 