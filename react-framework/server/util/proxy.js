/**
 * CNode api，请求的是CNode网站提供的api，有的请求需要accesstoken有的不需要，这个js就是对这种情况的处理
*/
const axios = require('axios')
const querystring = require('query-string')

const baseUrl = 'http://cnodejs.org/api/v1'

module.exports = function (req, res, next) {
    const path = req.path
    const user = req.session.user || {}
    const needAccessToken = req.query.needAccessToken

    // 需要accessToken并且accessToken不存在
    if (needAccessToken && !user.accessToken) {
        res.status(401).send({
            success: false,
            msg: 'need login'
        })
    }

    const query = Object.assign({}, req.query, {
        accesstoken: (needAccessToken && req.method === 'GET') ? user.accessToken : ''
    })
    if (query.needAccessToken) delete query.needAccessToken

    axios(`${baseUrl}${path}`, {
        method: req.method,
        params: query,
        data: querystring.stringify(Object.assign({}, req.body, {
            accesstoken: (needAccessToken && req.method === 'POST') ? user.accessToken : ''
        })),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(resp => {
        if (resp.status === 200) {
            res.send(resp.data)
        } else {
            res.status(resp.status).send(resp.data)
        }
    }).catch(err => {
        if (err.response) {
            res.status(500).send(err.response.data)
        } else {
            res.status(500).send({
            success: false,
            msg: '未知错误'
            })
        }
    })
}
