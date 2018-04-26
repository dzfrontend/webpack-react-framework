const ReactSSR = require('react-dom/server')
const asyncBootstrap = require('react-async-bootstrapper').default
const ejs = require('ejs')
const serialize = require('serialize-javascript')
const Helmet = require('react-helmet').default

const getStoreState = (stores) => {
    return Object.keys(stores).reduce((result, storeName) => {
        result[storeName] = stores[storeName].toJson()
        return result
    }, {})
}

module.exports = (bundle, template, req, res) => {
    return new Promise((resolve, reject) => {
        // router和mobx处理
        const createStoreMap = bundle.createStoreMap
        const createApp = bundle.default
        const routerContext = {}
        const stores = createStoreMap()
        const app = createApp(stores, routerContext, req.url) // createApp就是client/server-entry.js export default

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
            const helmet = Helmet.rewind()
            // res.send(template.replace('<app></app>', appString)) // 用ejs代替，才能渲染出mobx state
            const html = ejs.render(template, {
                appString: appString,
                initialState: serialize(state),
                meta: helmet.meta.toString(), // seo等
                title: helmet.title.toString(),
                style: helmet.style.toString(),
                link: helmet.link.toString()
            })
            res.send(html)
            resolve()
        })
        .catch(reject)
    })
}
