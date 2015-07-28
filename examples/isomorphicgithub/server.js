/*eslint-disable vars-on-top */
require('node-jsx').install({
  extension: '.jsx',
  harmony: true
})

var Router = require('react-router')
var React = require('react')
var express = require('express')
var routes = require('./src/routes')
var alt = require('./src/alt')
var app = express()
var path = require('path')
var axios = require('axios')

var actions = require('./src/actions.js')

axios.interceptors.request.use(function (config) {
  config.url = config.url.replace(/^\/github\//, 'http://localhost:8000/github/')
  return config
})

app.set('view engine', 'jade')
app.set('views', path.join(__dirname, 'templates'))
app.use(express.static(path.join(__dirname, 'dist')))

app.get('/github/*', function (req, res) {
  // console.log('https://api.github.com/' + req.params[0])
  axios.get('https://api.github.com/' + req.params[0])
  .then(function (response) {
    // console.log('then', response.data)
    res.send(response.data)
  })
  .catch(function (response) {
    console.log('catch', response)
    res.status(500).send(response)
  })
})
app.use(function (req, res, next) {
  // console.log('path:', req.path)
  Router.run(routes, req.path, function (Handler, state) {
    if (state.routes.some(function (route) {
      return route.name === 'notFound'
    })) {
      next()
      return
    }
    // console.log(state.path, state.params)
    // console.log(state.routes.map(function (r) {
    //   return [r.name, r.paramNames]
    // }))
    state.routes.forEach(function (route) {
      switch (route.name) {
      case 'user':
        actions.getUser(state.params)
        break
      case 'repo':
        actions.getRepo(state.params)
        break
      case 'userrepos':
        actions.getUserRepos(state.params)
        break
      }
    })
    alt.whenStable(function (dataEl) {
      res.render('layout', {
        html: React.renderToString(React.createElement(Handler, {params: state.params, query: state.query})) + dataEl
      })
    })
  })
})

app.listen(8000, function () {
  console.log('Listening on localhost:8000')
})
