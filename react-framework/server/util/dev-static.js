/**
 * React本地开发'development'环境的服务端渲染配置：
 */
const axios = require('axios')
const path = require('path')
const webpack = require('webpack')
const MemoryFs = require('memory-fs') // 从内存读取
const serverConfig = require('../../webpack/webpack.config.server') // 服务端webpack配置
const ReactSSR = require('react-dom/server')
const proxy = require('http-proxy-middleware') // expres代理中间件，代理

const getTemplate = () => {
  return new Promise((resolve, reject) => {
  	// 这里用axios而不用path读取，是因为dev环境没有生成打包文件
    axios.get('http://localhost:8888/public/index.html')
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

const serverCompiler = webpack(serverConfig)
const mfs = new MemoryFs
serverCompiler.outputFileSystem = mfs // 把mfs配置到webpack
const Module = module.constructor // 模块
let serverBundle

serverCompiler.watch({}, (err, stats) => {
	if (err) throw err
	// 错误和警告
	stats = stats.toJson()
	stats.errors.forEach(err => console.error(err))
	stats.warnings.forEach(warn => console.warn(warn))

	// 内存中的路径
	const bundlePath = path.join(
		serverConfig.output.path,
		serverConfig.output.filename
	)

	// 文件从内存读出为String，需要变成模块
	const bundle = mfs.readFileSync(bundlePath, 'utf-8')
	const m = new Module()
	m._compile(bundle, 'server-entry.js') //m_compile编译bundle成模块，命名为'server-entry.js'
	serverBundle = m.exports.default // 模块的default
})

module.exports = function(app){
	/* 
	 * 静态资源请求
	 * webpack-dev-server并没有生成本地静态资源，无法指定静态资源目录。
	 * 所以请求/public时用proxy代理到http://locathost:8888请求webpack-dev-server的资源
	*/
	app.use('/public', proxy({
	    target: 'http://localhost:8888'
	}))

	// 服务端请求
	app.get('*', function(req,res) {
		getTemplate().then(template => {
			const appString = ReactSSR.renderToString(serverBundle)
			res.send(template.replace('<app></app>', appString))
		})
	})
}