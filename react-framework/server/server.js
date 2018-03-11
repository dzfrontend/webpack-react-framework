/**
 * React服务端渲染配置：
 * React如何使用服务端渲染：react-dom/server用于服务端将react组件渲染成html
 */
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
