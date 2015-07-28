var React = require('react')
var RepoStore = require('../stores/RepoStore')
var actions = require('../actions.js')

var Repo = React.createClass({
  getInitialState: function () {
    return RepoStore.getState()
  },
  componentDidMount: function () {
    var p = this.props.params
    var search = p.user + '/' + p.repo
    RepoStore.listen(this.onChange)
    if (this.state.repo.search !== search) {
      actions.getRepo(p)
    }
  },
  onChange: function (state) {
    this.setState(state)
  },
  render: function () {
    var r = this.state.repo
    return r.name ? (<div className="repo">
      <h1>{r.full_name}</h1>
      <p>{r.description}</p>
      <p>{r.homepage}</p>
    </div>) : (<img src="/loading.gif" />)
  },
  componentWillUnmount: function () {
    RepoStore.unlisten(this.onChange)
  }
})

module.exports = Repo
