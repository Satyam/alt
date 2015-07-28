var alt = require('../alt')
var actions = require('../actions.js')
var axios = require('axios')

function RepoStore() {
  this.repo = {}
  this.bindActions(actions)
}

RepoStore.prototype.onGetRepo = function (data) {
  var self = this
  return axios.get('/github/repos/' + data.user + '/' + data.repo)
  .then(function (response) {
    self.repo = response.data
    self.repo.search = data.user + '/' + data.repo
  })
  .catch(function (response) {
    console.log('*** RepoStore:onGetRepo:error', response)
  })
}

module.exports = alt.createStore(RepoStore, 'RepoStore')
