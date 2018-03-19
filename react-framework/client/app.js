import React from 'react'
import ReactDom from 'react-dom'
import App from './App.jsx'
import { AppContainer } from 'react-hot-loader' // eslint-disable-line

// ReactDom.render(<App/>,document.getElementById('root'))

// 热加载配置引入的组件加<AppContainer>包裹
const render = (Comment) => {
    // 服务端渲染ReactDom.render替换成ReactDom.hydrate
    ReactDom.hydrate(
      <AppContainer>
        <Comment />
      </AppContainer>,
      document.getElementById('root'),
    )
}
render(App)
if (module.hot) {
    module.hot.accept('./App.jsx', () => {
        const App = require('./App.jsx').default // eslint-disable-line
        render(App)
    })
}
