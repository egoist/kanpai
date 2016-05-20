'use strict'
const Path = require('path')
const spawnSync = require('cross-spawn').sync
const symbols = require('log-symbols')
const figures = require('figures')
const config = require('./config')

function hr(text) {
  const char = figures.pointer.green
  console.log(`${char.repeat(5)} ${text}`)
}

function spawn() {
  const command = spawnSync.apply(null, arguments)
  const hasError = command.status !== 0
  const stderr = command.stderr && command.stderr.toString().trim()
  const sigint = command.signal === 'SIGINT'
  if (hasError || stderr || sigint) {
    let errorMessage = command.error && command.error.message
    if (stderr) {
      errorMessage = stderr
    } else if (sigint) {
      errorMessage = 'Unexpected exited with signal SIGINT'
    }
    if (errorMessage) {
      console.log(errorMessage)
    }
    console.log(`${symbols.error} Failed to publish new version.`.red)
    process.exit(command.status)
  } else {
    return command
  }
}

function readKanpai(pkg) {
  return pkg.kanpai || {}
}

module.exports = function (type, cli, pkg) {
  const kanpai = readKanpai(pkg)

  // prepare git before all
  hr('PREPARE GIT')
  spawn('sh', [Path.join(__dirname, 'git-prepare.sh')], {stdio: 'inherit'})

  hr('TEST')
  const testCommand = cli.flags.test || kanpai.testScript || config.get('testScript')
  spawn('npm', ['run', testCommand], {stdio: 'inherit'})

  if (!cli.flags.push) {
    hr('VERSION')
    const commitMessage = cli.flags.message || kanpai.commitMessage || config.get('commitMessage')
    spawn('npm', ['version', type, '-m', commitMessage], {stdio: 'inherit'})

    hr('PUBLISH')
    spawn('npm', ['publish'], {stdio: 'inherit'})
  }

  hr('PUSH')
  spawn('git', ['push', '--follow-tags'], {stdio: 'inherit'})

  console.log(`${symbols.success} Everything done!`)
}
