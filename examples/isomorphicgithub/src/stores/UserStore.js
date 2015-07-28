var alt = require('../alt')
var actions = require('../actions.js')
var axios = require('axios')

function UserStore() {
  this.user = {}
  this.bindActions(actions)
}

UserStore.prototype.onGetUser = function (data) {
  var self = this
  return axios.get('/github/users/' + data.user)
  .then(function (response) {
    self.user = response.data
    self.user.search = data.user
  })
  .catch(function (response) {
    console.log('*** UserStore:onGetUser:error', response)
  })
}

module.exports = alt.createStore(UserStore, 'UserStore')
