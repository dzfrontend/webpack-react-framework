# webpack-react-framework

主要介绍React项目环境如何配置，项目如何架构的。


# 项目如何架构的

## 1.工程架构

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

> babel支持es6语法，安装babel-loader后想要支持jsx，还要在根目录新建babel的配置文件.babelrc

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
		...entry,
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
		...entry,
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

> 接下来在package.json的"scripts"配置环境变量为development的命令。
  
> 其中**设置环境变量**为webpack中process.env.NODE_ENV === 'development'配置的话，需要安装**npm i cross-env -D**，然后cross-env NODE_ENV=development就设置了环境变量为'development'

	"dev:client": "cross-env NODE_ENV=development webpack-dev-server --config webpack/webpack.config.client.js"

在本地开发时，命令行工具运行npm run dev:client，就运行了webpack-dev-server，浏览器访问<http://localhost:8888/>.


> 实现局部热加载 npm i react-hot-loader -D

在.babelrc文件加上

	{
		"presets"：...，
		"plugins": ["react-hot-loader/babel"]
	}

在webpack/webpack.config.client.js里加上

```javascript

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

```

在入口文件写为

```javascript

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

```
### react服务端渲染基础配置

> React如何使用服务端渲染：react-dom/server用于服务端将react组件渲染成html。  

> 搭建一个nodejs服务器，通过ReactSSR.renderToString将服务端渲染的内容替换本地的内容，来达到服务端返回解析的内容  

> npm i express -S

server/server.js：

```javascript

	const express = require('express')
	const ReactSSR = require('react-dom/server')
	const fs = require('fs')
	const path = require('path')
	
	const app = express()

	// react服务端webpack配置webpack.config.server.js运行打包后的文件
	const serverEntry = require('../dist/server-entry').default

	// html打包后的模板，用来插入服务端渲染后的html
	const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8') //readFileSync同步读取

	/* 
	 * 静态文件请求
	 * 指定../dist为静态文件目录，'/public'为webpack里output的publicPath路径，请求带有'/public'表示为静态资源请求，指向'../dist'目录
	*/
	app.use('/public', express.static(path.join(__dirname, '../dist'))) 

	// 服务端请求
	app.get('*', function(req,res){
		const appString = ReactSSR.renderToString(serverEntry)
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

webpack/webpack.config.server.js和之前配置类似，入口文件改为了server-entry.js

```javascript

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

> 在package.json配置命令打包入口文件和服务端渲染的前端入口文件  

> 其中清除文件的命令"clear"需要安装npm i rimraf -D

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

### react服务端渲染本地环境配置

> 和react服务端渲染基础配置类似，只是本地开发环境用的是webpack-dev-server，没有生成本地打包文件；解决方案是通过axios请求本地服务器的资源 + webpack编译webpack.config.server.js。具体实现本地服务端渲染代码在server/util/dev-static.js

在package.json里

	"scripts": {
		"dev:client": "cross-env NODE_ENV=development webpack-dev-server --config webpack/webpack.config.client.js",
    	"dev:server": "cross-env NODE_ENV=development node server/server.js",
	}

> 运行npm run dev:client 首先启动本地开发环境服务器webpck-dev-server  
> 运行npm run dev:server 启动本地服务端渲染  
> 访问 <http://localhost:3333> 查看index.html里面的div id="root"里面有内容，说明本地服务端渲染配置成功


### 使用eslint和editconfig规范代码

#### eslint

> 作用：规范代码  
> .eslintrc文件为eslint的配置文件  
> rules里面可以定义一些忽略规则；在代码里想要忽略检查可以加上eslint-disable-line。

安装的插件详见代码。

根目录.eslintrc：全局eslint

	{
	  "extends": "standard" //标准的规则
	}

client/.eslintrc：react的eslint规则

> 其中rules里面可以定义一些忽略规则，添加了忽略规则不会报相应错误提示

	{
	  // 解析器(解析js)
	  "parser": "babel-eslint",
	  "env": {
	    "browser": true, // 执行环境为browser，包含window对象
	    "es6": true,
	    "node": true
	  },
	  "parserOptions": {
	    "ecmaVersion": 6,
	    "sourceType": "module"
	  },
	  // airbnb规则，适用于react
	  "extends": "airbnb",
	  "rules": {
	    //不写分号
	    "semi": [0],
	    // 报linebreak-style错误忽略
	    "linebreak-style": 0,
	    // 不能写在js而是jsx忽略
	    "react/jsx-filename-extension": [0],
	    // 缩进忽略
	    "indent": [0]
	  }
	}

> 配置了.eslintrc文件还不够，还需要在webpack.config里面的rules加上eslint配置

```javascript

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
            }
        ]
    },

``` 


#### editconfig

> 编辑器配置插件，vscode和sublime需要安装EditorConfig插件，.editorconfig配置文件才有效。

.editorconfig

	root = true // 项目根目录
	
	[*]
	charset = utf-8
	indent_style = space
	indent_size = 4
	end_of_line = lf
	insert_final_newline = true // 末尾自动添加一行空行
	trim_trailing_whitespace = true // 末尾去掉空格

#### eslint正确git才能提交

> 安装 npm i husky -D

在package.json

	"scripts":{
		"precommit": "eslint --ext .js --ext .jsx"
	}

在执行git commit之前，会执行precommit命令，只有eslint正确才能提交。

## 2.项目架构

### React-Router4路由配置

>  npm i react-router react-router-dom -S  

> react-router4使用的时候只需引用 react-router-dom，如果搭配 redux，你还需要使用 react-router-redux

先配置路由地址：

```javascript
	
	import { BrowserRouter, Route, Redirect } from 'react-router-dom'

	ReactDOM.render(
	  (<BrowserRouter>
	    <App> {/* app组件 */}
	        <Route key="index" path="/" render={() => <Redirect to="/list" />} exact />
	        <Route key="list" path="/list" component={TopicList} />
	        <Route key="detail" path="/detail" component={TopicDetail} />
	    </App>
	  </BrowserRouter>),
	  document.getElementById('root')
	);
	
	// app组件中
	class App extends Component {
	  render() {
	    return (
	      {this.props.children} // 将配置路由渲染
	    );
	  }
	}
```

> 其中**< Route />必须要< BrowserRouter >包裹**，Redirect为重定向

配置好路由后就可以直接通过指定的path路径访问

```javascript

	import { Link } from 'react-router-dom'

	class App extends Component {
	  render() {
	    return (
	      <div>
        	<Link to="/">首页</Link>
        	<Link to="/list">列表页</Link>
        	<Link to="/detail">详情页</Link>
	      </div>
	    );
	  }
	}

```

## 项目目录

