var Router = require('react-router')
var React = require('react')
var alt = require('./alt')
var routes = require('./routes.jsx')

alt.isoBootstrap()
Router.run(routes, Router.HistoryLocation, function (Handler, state) {
  React.render(<Handler params={state.params} query={state.query}/>, document.getElementById('app'))
})
