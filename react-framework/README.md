# webpack-react-framework

主要介绍React项目环境如何配置，项目如何架构的。


## 项目如何架构的

### Webpack基础配置

webpack官方文档：<http://webpackjs.org>  
webpack打包初始化：  

> 安装npm i webpack --save -dev  
> 在webpack/webpack.config.client.js里写好配置  
> package.json的"scripts"添加 "build": "webpack --config webpack/webpack.config.client.js"  
> 运行npm run build

webpack/webpack.config.client.js：

```javascript
	
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
```


运行npm run build后，将client/app.js打包生成dist/app.hash.js

### Webpack loader基础应用

配置打包react的loader：  

> 处理jsx文件，安装npm i babel-loader -D(--save -dev)

> babel支持es6语法，安装babel-loader后想要支持jsx，还要在更目录新建babel的配置文件.babelrc

> 此外还要安装npm i babel-core babel-preset-es2015 babel-preset-es2015-loose babel-preset-react -D

.babelrc配置：presets为要配置支持的语法

	{
		"presets": [
			["es2015", { "loose": true }],
			"react"
		]
	}

webpack/webpack.config.client.js：

```javascript

	const path = require('path')
	const HTMLPlugin = require('html-webpack-plugin')
	module.exports = {
	    ...entry,
		...output,
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
	    }
	}
```

> 安装html-webpack-plugin,自动生成index.html文件并且把打包文件注入html里面

```javascript

	module.exports = {
		..entry,
    	...output,
		...module,
		plugins: [
	        new HTMLPlugin({
	            template: path.join(__dirname, '../client/template.html') //指定模板文件
	        }) // 安装html-webpack-plugin插件,自动生成index.html文件(如果不存在指定模板文件时),并且把打包文件注入html里面
	    ]
	}
```  

这样就简单配置成功打包react的应用啦。

### Webpack-dev-server

> 本地服务器和自动编译打包的作用
> npm i webpack-dev-server -D

webpack/webpack.config.client.js 下面为webpack-dev-server的配置

```javascript

	const config = {
		..entry,
    	...output,
		...module,
		plugins
	}
	const isDev = process.env.NODE_ENV === 'development' //用于命令行运行package.json设置的环境变量的判断

	// 如果运行的环境变量为'development'，则启用webpack-dev-server
	if(isDev){
	    config.devServer = {
	        host: '0.0.0.0', //可以使用任何方式访问 => 本地ip/localhost/127.0.0.1
	        port: '8888', //端口号
	        contentBase: path.join(__dirname, '../dist'), // 本地服务器的访问路径
	        // hot: true, // hot-module-replacement是否启动，即热加载，需要安装react-hot-loader
	        overlay: {errors: true},
	        publicPath: '/public', //和webpack里output publicPath对应一样，不然加载文件的路径不对
	        historyApiFallback: {
	            index: '/public/index.html' //所有请求的不存在页面到这里来
	        }
	    }
	}
	
	module.exports = config
```

> 接下来在package.json的"scripts"配置环境变量为development的命令，在本地开发用这个命令

	"dev:client": "cross-env NODE_ENV=development webpack-dev-server --config webpack/webpack.config.client.js"

命令行工具运行npm run dev:client，就运行了webpack-dev-server，浏览器访问<http://localhost:8888/>.


> 实现局部热加载 npm i react-hot-loader -D

在.babelrc文件加上

	{
		"presets"：...，
		"plugins": ["react-hot-loader/babel"]
	}

在webpack/webpack.config.client.js里加上

	if(isDev){
	    config.entry = { //热加载打包入口文件增加打包文件'react-hot-loader/patch'
	        app: [
	            'react-hot-loader/patch',
	            path.join(__dirname, '../client/app.js')
	        ]
	    }
	    ...config.devServer
	    config.plugins.push(new webpack.HotModuleReplacementPlugin()) //热加载加入pugins里
	}

在入口文件写为

	import React from 'react'
	import ReactDom from 'react-dom'
	import App from './App.jsx'
	import { AppContainer } from 'react-hot-loader' // 热加载
	
	// ReactDom.render(<App/>,document.getElementById('root'))
	
	// 热加载配置引入的组件加<AppContainer>包裹
	const render = (Comment) => {
	    ReactDom.render(
	        <AppContainer>
	            <Comment />
	        </AppContainer>,
	        document.getElementById('root')
	    )
	}
	render(App)
	if(module.hot){
	    module.hot.accept('./App.jsx',()=>{
	        const App = require('./App.jsx').default
	        render(App)
	    })
	}

### react服务端渲染基础配置

> React如何使用服务端渲染：react-dom/server用于服务端将react组件渲染成html。  

> 搭建一个nodejs服务器，通过ReactSSR.renderToString将服务端渲染的内容替换本地的内容，来达到服务端返回解析的内容  

> npm i express -S

server/server.js：

```javascript

	const express = require('express')
	const ReactSSR = require('react-dom/server')
	const serverEntry = require('../dist/server-entry').default // react服务端入口文件打包后的文件
	const fs = require('fs')
	const path = require('path')
	
	// html打包后的模板，用来插入服务端渲染后的html
	const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8') //readFileSync同步读取
	
	const app = express()
	
	// 静态文件请求
	// 指定../dist为静态文件目录，'/public'为webpack里output的publicPath路径，请求带有'/public'表示为静态资源请求，指向'../dist'目录
	app.use('/public', express.static(path.join(__dirname, '../dist'))) 
	
	// 服务端请求
	app.get('*', function(req,res){
		const appString = ReactSSR.renderToString(serverEntry)
		// 将服务端渲染的内容替换本地的内容
		res.send(template.replace('<app></app>', appString))
	})
	
	app.listen(3333, function () {
	  console.log('server is listening on 3333')
	})
```
> 接着需要配置服务端渲染的前端入口文件client/server-entry.js，和webpack打包配置webpack/webpack.config.server.js

client/server-entry.js

```javascript

	import React from 'react'
	import App from './App.jsx'
	
	// ReactDom.render(<App/>,document.body)
	// 服务端没有dom节点，所以服务端渲染需要重新新建一个入口文件，并用export default组件的方式导出
	export default <App />
```

webpack/webpack.config.server.js为之前打包react的配置。


> 在package.json配置命令打包入口文件和服务端渲染的前端入口文件

	{
		"scripts": {
			"build:client": "webpack --config webpack/webpack.config.client.js",
		    "build:server": "webpack --config webpack/webpack.config.server.js",
		    "clear": "rimraf dist", //清除dist文件夹内容
		    "build": "npm run clear && npm run build:client && npm run build:server", // 打包入口文件和服务端渲染的前端入口文件
		    "start": "node server/server.js"
		}
	}

命令行工具运行下面命令，react服务端渲染基础配置完成

	npm run build // 同时打包
	npm run start // 启动服务端渲染


## 项目目录

