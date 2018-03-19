/**
 * 服务端渲染加的webpack配置
 */
 const path = require('path')
 const HTMLPlugin = require('html-webpack-plugin')

 module.exports = {
 	target: 'node', //target表示执行环境为node
 	entry: {
 		app: path.join(__dirname, '../client/server-entry.js')
 	},
 	output: {
 		filename: 'server-entry.js', //server端没有用hash
 		path: path.join(__dirname, '../dist'), //打包路径
        publicPath: '/public/', //前缀
        libraryTarget: 'commonjs2' //server端commonjs规范，适用于服务端
 	},
	module: {
        rules: [
            {
                // eslint配置
                enforce: 'pre', //在执行rules之前
                test: /.(js|jsx)$/,
                loader: 'eslint-loader',
                exclude: [
                  path.resolve(__dirname, '../node_modules')
                ]
            },
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
    }
 }