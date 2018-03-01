/**
 * webpack配置
 */
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')

module.exports = {
    // 入口文件
    entry: {
        app: path.join(__dirname, '../client/app.js')
    },
    // 打包文件
    output: {
        filename: '[name].[hash].js', //打包文件名，ame为entry的name
        path: path.join(__dirname, '../dist'), //打包路径
        publicPath: '' //前缀 
    },
    module: {
        rules: [
            {
                test: /.jsx$/, //匹配后缀为jsx的文件
                loader: 'babel-loader' // 编译loader
            },
            {
                test: /.js$/,
                loader: 'babel-loader',
                exclude: [
                    path.join(__dirname,'../node_modules') //排除的文件夹
                ]
            }
        ]
    },
    plugins: [
        new HTMLPlugin() // 安装html-webpack-plugin插件,自动生成index.html文件并且把打包文件注入html里面
    ]
}
