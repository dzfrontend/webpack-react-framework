import React from 'react'
import ReactDom from 'react-dom'
import { AppContainer } from 'react-hot-loader' // eslint-disable-line
import { BrowserRouter } from 'react-router-dom'

import App from './Views/App'

// 热加载配置 => 引入的组件加<AppContainer>包裹
const render = (Component) => {
    // 服务端渲染ReactDom.render替换成ReactDom.hydrate
    ReactDom.hydrate(
      <AppContainer>
        <BrowserRouter>
          <Component />
        </BrowserRouter>
      </AppContainer>,
      document.getElementById('root'),
    )
}

// ReactDom.render(<App/>,document.getElementById('root'))
render(App)

// 热加载
if (module.hot) {
    module.hot.accept('./Views/App', () => {
        const App = require('./Views/App').default // eslint-disable-line
        render(App)
    })
}
