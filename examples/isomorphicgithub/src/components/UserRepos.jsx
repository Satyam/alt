var React = require('react')
var UserReposStore = require('../stores/UserReposStore')
var actions = require('../actions.js')
var Link = require('react-router').Link

var UserRepos = React.createClass({
  getInitialState: function () {
    return UserReposStore.getState()
  },
  componentDidMount: function () {
    UserReposStore.listen(this.onChange)
    if (this.state.repos.search === this.props.user) {
      actions.getUserRepos(this.props.params)
    }
  },
  onChange: function (state) {
    this.setState(state)
  },
  render: function () {
    var r = this.state.repos
    return r.length ? (<div className="user-repos">
      <h1>{r.search}</h1>
      <ul>
        {r.map(function (repo) {
          return (<li key={repo.id}><Link to="repo" params={{
            user: repo.owner.login,
            repo: repo.name
          }}>{repo.full_name}</Link></li>)
        })}
      </ul>
      <p>{r.description}</p>
      <p>{r.homepage}</p>
    </div>) : (<img src="/loading.gif" />)
  },
  componentWillUnmount: function () {
    UserReposStore.unlisten(this.onChange)
  }
})

module.exports = UserRepos
