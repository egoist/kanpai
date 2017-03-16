'use strict'
const Configstore = require('configstore')

module.exports = new Configstore('kanpai', {
  commitMessage: 'Release v%s',
  test: 'test'
})
