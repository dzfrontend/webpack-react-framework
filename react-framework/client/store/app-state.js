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
}

const appState = new AppState()

setInterval(() => {
    appState.add()
}, 1000)
export default appState
