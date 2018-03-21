import React from 'react'
import {
    Route,
    Redirect,
} from 'react-router-dom'

import TopicList from '../Views/topic-list/index'
import TopicDetail from '../Views/topic-detail/index'

export default () => [
  <Route key="index" path="/" render={() => <Redirect to="/list" />} exact />,
  <Route key="list" path="/list" component={TopicList} />,
  <Route key="detail" path="/detail" component={TopicDetail} />,
]
