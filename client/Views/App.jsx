import React from 'react'
import {
  Link,
} from 'react-router-dom'
import Routes from '../route/router'

export default class App extends React.Component {
  componentDidMount() {
    // do something here
  }

  render() {
    return [
      <div key="banner">
        <Link to="/">首页</Link>
        <br />
        <Link to="/list">列表页</Link>
        <br />
        <Link to="/detail">详情页</Link>
        <br />
        <Link to="/mobx">mobx配置</Link>
      </div>,
      <Routes key="routes" />,
    ]
  }
}
