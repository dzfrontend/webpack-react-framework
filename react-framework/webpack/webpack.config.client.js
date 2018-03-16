/**
 * webpack配置
 */
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const config = {
    // 入口文件
    entry: {
        app: path.join(__dirname, '../client/app.js')
    },
    // 打包文件
    output: {
        filename: '[name].[hash].js', //打包文件名，ame为entry的name
        path: path.join(__dirname, '../dist'), //打包路径
        publicPath: '/public/' //前缀 
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
        new HTMLPlugin({
            template: path.join(__dirname, '../client/template.html') //指定模板文件
        }) // 安装html-webpack-plugin插件,自动生成index.html文件(如果不存在指定模板文件时),并且把打包文件注入html里面
    ]
}

const isDev = process.env.NODE_ENV === 'development' //用于命令行运行package.json设置的环境变量的判断

// 如果运行的环境变量为'development'，则启用webpack-dev-server
if(isDev){
    config.entry = { //热加载打包入口文件增加打包文件'react-hot-loader/path'
        app: [
            'react-hot-loader/patch',
            path.join(__dirname, '../client/app.js')
        ]
    }
    config.devServer = {
        host: '0.0.0.0', //可以使用任何方式访问 => 本地ip/localhost/127.0.0.1
        port: '8888', //端口号
        contentBase: path.join(__dirname, '../dist'), // 本地服务器的访问路径
        hot: true, // hot-module-replacement是否启动，即热加载，需要安装react-hot-loader
        overlay: {errors: true},
        publicPath: '/public/', //和webpack里output publicPath对应一样，不然加载文件的路径不对
        historyApiFallback: {
            index: '/public/index.html' //所有请求的不存在页面到这里来
        }
    }
    config.plugins.push(new webpack.HotModuleReplacementPlugin()) //热加载加入pugins里
}

module.exports = config
