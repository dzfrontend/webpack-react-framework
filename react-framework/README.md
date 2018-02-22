# webpack-react-framework

主要介绍React项目环境如何配置，项目如何架构的。


## 项目如何架构的

### Webpack基础配置

安装webpack --save -dev  
在build/config.js里写好配置  
package.json添加 "build": "webpack --config build/webpack.config.js"  
运行npm run build

build/config.js：

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

运行npm run build后，将client/app.js打包生成dist/app.hash.js


## 项目目录

