/**
 * 服务端渲染前端入口
 */
import React from 'react'
import App from './views/App'

// ReactDom.render(<App/>,document.body)
// 服务端没有dom节点，所以服务端渲染需要重新新建一个入口文件，并用export default组件的方式导出
export default <App />
