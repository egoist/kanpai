'use strict'
const Configstore = require('configstore')

module.exports = new Configstore('kanpai', {
  commitMessage: '-> v%s',
  test: 'test'
})
