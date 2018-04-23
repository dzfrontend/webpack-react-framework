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
const asyncBootstrap = require('react-async-bootstrapper').default
const ejs = require('ejs')
const serialize = require('serialize-javascript')

const getTemplate = () => {
    return new Promise((resolve, reject) => {
        // 这里用axios而不用path读取，是因为dev环境没有生成打包文件
        // axios.get('http://localhost:8888/public/index.html')
        axios.get('http://localhost:8888/public/server.ejs')
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

// const Module = module.constructor // 模块 改成下面的
const NativeModule = require('module')
const vm = require('vm')
const getModuleFromString = (bundle, filename) => {
    const m = { exports: {} }
    const wrapper = NativeModule.wrap(bundle)
    const script = new vm.Script(wrapper, {
        filename: filename,
        displayErrors: true,
    })
    const result = script.runInThisContext()
    result.call(m.exports, m.exports, require, m)
    return m
}

const serverCompiler = webpack(serverConfig)
const mfs = new MemoryFs
serverCompiler.outputFileSystem = mfs // 把mfs配置到webpack
let serverEntry, createStores

// webpack打包
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
    // const m = new Module()
    // m._compile(bundle, 'server-entry.js') //m_compile编译bundle成模块，命名为'server-entry.js'
    const m = getModuleFromString(bundle, 'server-entry.js')
    serverEntry = m.exports.default // 模块的default
    createStores = m.exports.createStoreMap // 取webpack里面store
})


const getStoreState = (stores) => {
    return Object.keys(stores).reduce((result, storeName) => {
        result[storeName] = stores[storeName].toJson()
        return result
    }, {})
}

module.exports = function (app) {
	/*
	 * 静态资源请求
	 * webpack-dev-server并没有生成本地静态资源，无法指定静态资源目录。
	 * 所以请求/public时用proxy代理到http://locathost:8888请求webpack-dev-server的资源
	*/
    app.use('/public', proxy({
        target: 'http://localhost:8888'
    }))

    // 服务端请求
    app.get('*', function (req, res) {
        getTemplate().then(template => {
            // router和mobx处理
            const routerContext = {}
            const stores = createStores()
            const app = serverEntry(stores, routerContext, req.url) // serverEntry就是client/server-entry.js export default

            asyncBootstrap(app).then( () => {
                // 解决react-router重定向问题
                if(routerContext.url){ // asyncBootstrap之后拿到routerContext，有url说明是重定向
                    res.status(302).setHeader('Location', routerContext.url) // 自动跳转到重定向路由
                    res.end()
                    return
                }

                // 解决重定向mobx state
                const state = getStoreState(stores) // 解析 toJson的state
                console.log(serialize(state))

                const appString = ReactSSR.renderToString(app)
                // res.send(template.replace('<app></app>', appString)) // 用ejs代替，才能渲染出mobx state
                const html = ejs.render(template, {
                    appString: appString,
                    initialState: serialize(state),
                })
                res.send(html)
            })
        })
    })
}
