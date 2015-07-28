var alt = require('../alt')
var actions = require('../actions.js')
var axios = require('axios')

function UserReposStore() {
  this.repos = []
  this.bindActions(actions)
}

UserReposStore.prototype.onGetUserRepos = function (data) {
  var self = this
  return axios.get('/github/users/' + data.user + '/repos')
  .then(function (response) {
    self.repos = response.data
    self.repos.search = data.user
  })
  .catch(function (response) {
    console.log('*** UserReposStore:onGetRepo:error', response)
  })
}

module.exports = alt.createStore(UserReposStore, 'UserReposStore')
