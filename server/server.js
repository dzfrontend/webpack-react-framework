/**
 * React服务端渲染配置：
 * React如何使用服务端渲染：react-dom/server用于服务端将react组件渲染成html
 */
const express = require('express')
const favicon = require('serve-favicon')
// const ReactSSR = require('react-dom/server')
const fs = require('fs')
const path = require('path')
const serverRender = require('./util/server-render') // development and production

const isDev = process.env.NODE_ENV === 'development'

const app = express()
app.use(favicon(path.join(__dirname, '../favicon.ico')))

/*
// CNode api开始 和服务端渲染无关
const bodyParser = require('body-parser')
const session = require('express-session')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
  maxAge: 10 * 60 * 1000,
  name: 'tid',
  resave: false,
  saveUninitialized: false,
  secret: 'react cnode class'
}))
app.use('/api/user', require('./util/handle-login')) // api/user开头的api请求的文件
app.use('/api', require('./util/proxy')) // api开头的api请求的文件
// CNode api结束
*/


if (!isDev) {
    // react服务端webpack配置webpack.config.server.js运行打包后的文件
    const serverEntry = require('../dist/server-entry')
    // html打包后的模板，用来插入服务端渲染后的html
    const template = fs.readFileSync(path.join(__dirname, '../dist/server.ejs'), 'utf8')

    /*
    * 静态文件请求
    * 指定../dist为静态文件目录，'/public'为webpack里output的publicPath路径，请求带有'/public'表示为静态资源请求，指向'../dist'目录
    */
    app.use('/public', express.static(path.join(__dirname, '../dist')))

    // 服务端请求
    app.get('*', function (req, res, next) {
        serverRender(serverEntry, template, req, res).catch(next)
    })
} else {
    // dev环境
    const devStatic = require('./util/dev-static')
    devStatic(app) // 把app = express()传进去
}

// express的错误处理
app.use(function (error, req, res, next) {
    res.status(500).send(error)
})
app.listen(3333, function () {
    console.log('server is listening on 3333')
})


