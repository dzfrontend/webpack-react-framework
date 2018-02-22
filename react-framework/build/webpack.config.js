/**
 * webpack配置
 */
const path = require('path')
module.exports = {
    // 入口文件
    entry: {
        app: path.join(__dirname, '../client/app.js')
    },
    // 打包文件
    output: {
        filename: '[name].[hash].js', //打包文件名，ame为entry的name
        path: path.join(__dirname, '../dist'), //打包路径
        publicPath: 'public' //加上前缀 
    }
}
