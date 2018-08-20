/*
 * store入口
*/
import AppStateClass from './app-state'

export const AppState = AppStateClass

// 导出default
export default {
  AppState,
}

// 导出用作服务端渲染
export const createStoreMap = () => {
  return {
    appState: new AppState(),
  }
}
