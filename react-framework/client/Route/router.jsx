import React from 'react'
import {
    Route,
    Redirect,
} from 'react-router-dom'

import TopicList from '../views/topic-list/index'
import TopicDetail from '../views/topic-detail/index'
import MobxComponent from '../views/mobx/index'

export default () => [
  <Route key="index" path="/" render={() => <Redirect to="/list" />} exact />,
  <Route key="list" path="/list" component={TopicList} />,
  <Route key="detail" path="/detail" component={TopicDetail} />,
  <Route key="mobx" path="/mobx" component={MobxComponent} />,
]
