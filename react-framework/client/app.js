import React from 'react'
import ReactDom from 'react-dom'
import { AppContainer } from 'react-hot-loader' // eslint-disable-line
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'

import App from './views/App' // 入口页面
import appState from './store/app-state'

// 热加载配置 => 引入的组件加<AppContainer>包裹
const render = (Component) => {
    // 服务端渲染ReactDom.render替换成ReactDom.hydrate
    ReactDom.hydrate(
      <AppContainer>
        <Provider appState={appState}>
          <BrowserRouter>
            <Component />
          </BrowserRouter>
        </Provider>
      </AppContainer>,
      document.getElementById('root'),
    )
}

// ReactDom.render(<App/>,document.getElementById('root'))
render(App)

// 热加载
if (module.hot) {
    module.hot.accept('./views/App', () => {
        const App = require('./views/App').default // eslint-disable-line
        render(App)
    })
}
