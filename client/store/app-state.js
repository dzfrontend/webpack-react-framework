/*
 * MobX例子
*/
import { observable, computed, action } from 'mobx'

class AppState {
    constructor({ count, name } = { count: 0, name: 'Jack' }) {
        this.count = count
        this.name = name
    }
    // observable定义state
    @observable count
    @observable name

    // computed
    @computed get msg() {
        return `${this.name} say count is ${this.count}`
    }

    // action
    @action add() {
      this.count += 1
    }
    @action changeName(name) {
      this.name = name
    }

    // 这么写是因为服务端渲染需要返回json格式的state
    toJson() {
        return {
            count: this.count,
            name: this.name,
        }
    }
}

// const appState = new AppState()
// setInterval(() => {
//     appState.add()
// }, 1000)
// export default appState

export default AppState
