import React from 'react'
import ReactDom from 'react-dom'
import App from './App.jsx'
import { AppContainer } from 'react-hot-loader' // 热加载

// ReactDom.render(<App/>,document.getElementById('root'))

// 热加载配置引入的组件加<AppContainer>包裹
const render = (Comment) => {
    ReactDom.render(
        <AppContainer>
            <Comment />
        </AppContainer>,
        document.getElementById('root')
    )
}
render(App)
if(module.hot){
    module.hot.accept('./App.jsx',()=>{
        const App = require('./App.jsx').default
        render(App)
    })
}