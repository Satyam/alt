var React = require('react')
var UserStore = require('../stores/UserStore')
var actions = require('../actions.js')
var Link = require('react-router').Link

var User = React.createClass({
  getInitialState: function () {
    return UserStore.getState()
  },
  componentDidMount: function () {
    UserStore.listen(this.onChange)
    if (this.state.user.search !== this.props.params.user) {
      actions.getUser(this.props.params)
    }
  },
  onChange: function (state) {
    this.setState(state)
  },
  render: function () {
    var u = this.state.user
    return u.login ? (<div className="user">
      <h1>{u.login}</h1>
      <p>{u.name}</p>
      <p>{u.location}</p>
      <p><Link to="userrepos" params={{user: u.login}}>Repos</Link></p>
      <img src={u.avatar_url}/>
    </div>) : (<img src="/loading.gif" />)
  },
  componentWillUnmount: function () {
    UserStore.unlisten(this.onChange)
  }
})

module.exports = User
