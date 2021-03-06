/*
 * MobX在Component中的使用
*/
import React from 'react'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import { AppState } from '../../store/app-state'
// 将绑定好的mobx注册到组件中并且observer（监听mobx的state）
@inject('appState') @observer

export default class MobxComponent extends React.Component {
    constructor() {
        super()
        this.changeName = this.changeName.bind(this)
    }
    changeName(event) {
        this.props.appState.changeName(event.target.value)
    }

    asyncBootstrap() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.props.appState.add()
                resolve(true)
            })
        })
    }
    render() {
        return (
            <div>
                <Helmet>
                    {/* react-helmet用于react服务端渲染seo */}
                    <title>This is mobx page</title>
                    <meta name="description" content="This is description" />
                </Helmet>
                <div>mobx page</div>
                <input type="text" onChange={this.changeName} />
                <span>{this.props.appState.msg}</span>
            </div>

        )
    }
}

// react传入的props需要声明类型的话，用prop-types插件检测props的类型
MobxComponent.propTypes = {
    appState: PropTypes.instanceOf(AppState)
}
