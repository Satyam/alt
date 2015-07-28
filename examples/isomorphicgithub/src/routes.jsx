var React = require('react')
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute
var NotFoundRoute = Router.NotFoundRoute

var App = require('./components/App.jsx')
var User = require('./components/User.jsx')
var UserRepos = require('./components/UserRepos.jsx')
var Repo = require('./components/Repo.jsx')
var Empty = require('./components/Empty.jsx')

var routes = (
  <Route name='home' path='/' handler={App}>
    <Route name='user' path='/user/:user' handler={User} />
    <Route name='userrepos' path='/repos/:user' handler={UserRepos} />
    <Route name='repo' path='/repo/:user/:repo' handler={Repo} />
    <DefaultRoute name="default" handler={Empty}/>
    <NotFoundRoute name="notFound" handler={Empty}/>
  </Route>
)

module.exports = routes
