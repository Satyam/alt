var React = require('react')
var Router = require('react-router')
var RouteHandler = Router.RouteHandler
var Navigation = Router.Navigation

var App = React.createClass({
  mixins: [
    Navigation
    ],
  getInitialState: function () {
    return {value: ''}
  },
  onChange: function (ev) {
    this.setState({value: ev.target.value})
  },
  onClickUser: function () {
    this.transitionTo('user', {user: this.state.value})
  },
  onClickRepository: function () {
    this.transitionTo('repo', {repo: this.state.value})
  },
  render: function () {
    return (<div>
      <div className="search">
        Search:
        <input onChange={this.onChange} value={this.state.value}/>
        <button onClick={this.onClickUser}>User</button>
        <button onClick={this.onClickRepository}>Repository</button>
      </div>
      <RouteHandler {...this.props} />
    </div>)
  }
})

module.exports = App
