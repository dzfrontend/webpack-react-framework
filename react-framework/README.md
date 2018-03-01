# webpack-react-framework

主要介绍React项目环境如何配置，项目如何架构的。


## 项目如何架构的

### Webpack基础配置

webpack打包初始化：  

> 安装npm i webpack --save -dev  
> 在build/config.js里写好配置  
> package.json添加 "build": "webpack --config build/webpack.config.js"  
> 运行npm run build

build/config.js：

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

build/config.js：

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
	        new HTMLPlugin()
	    ]
	}
```  

这样就简单配置成功打包react的应用啦。

## 项目目录

