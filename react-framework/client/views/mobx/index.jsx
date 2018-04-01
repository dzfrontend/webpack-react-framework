/*
 * MobX在Component中的使用
*/
import React from 'react'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'

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
    render() {
        return (
            <div>
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
