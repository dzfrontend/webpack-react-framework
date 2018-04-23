/**
 * 服务端渲染前端入口
 */

/**
// 原来没有router，mobx的服务端渲染

import React from 'react'
import App from './views/App'

// ReactDom.render(<App/>,document.body)
// 服务端没有dom节点，所以服务端渲染需要重新新建一个入口文件，并用export default组件的方式导出
export default <App />
*/

import React from 'react'
import { StaticRouter } from 'react-router-dom' // StaticRouter为react-router提供的服务端渲染的router
import { Provider, useStaticRendering } from 'mobx-react'

import App from './views/App'
import { createStoreMap } from './store/store'

useStaticRendering(true) // 让mobx在服务端渲染的时候不会重复数据变换

export default (stores, routerContext, url) => (
    <Provider {...stores}>
        <StaticRouter context={routerContext} location={url}>
            <App />
        </StaticRouter>
    </Provider>
)

export { createStoreMap } // 用webpack打包后可以在dev-static.js里取到这个变量
