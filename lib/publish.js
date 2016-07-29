'use strict'
const Path = require('path')
const exec = require('child_process').exec
const co = require('co')
const spawnSync = require('cross-spawn').sync
const symbols = require('log-symbols')
const figures = require('figures')
const commitsBetween = require('commits-between')
const table = require('text-table')
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
    failed(command.status)
  } else {
    return command
  }
}

function failed(status) {
  console.log(`${symbols.error} Failed to publish new version.`.red)
  process.exit(status || 1)
}

function getLatestTag() {
  return new Promise((resolve, reject) => {
    exec('git describe --abbrev=0 --tags', (error, stdout, stderr) => {
      stdout = stdout.toString().trim()
      stderr = stderr.toString().trim()
      if (error) {
        if (error.message.trim().indexOf('fatal: No names found, cannot describe anything.') !== -1) {
          return resolve('')
        }
        return reject(error)
      }
      resolve(stdout.toString().trim())
    })
  })
}

function readKanpai(pkg) {
  return pkg.kanpai || {}
}

module.exports = co.wrap(function* (type, cli, pkg) {
  const kanpai = readKanpai(pkg)

  hr('CHECK GIT')
  spawn('sh', [Path.join(__dirname, 'git-prepare.sh')], {stdio: 'inherit'})

  hr('CHANGELOG')
  const latestTag = yield getLatestTag()
  if (latestTag) {
    const commits = yield commitsBetween({from: latestTag})
    if (commits.length === 0) {
      console.log(`You haven't made any changes since last release (${latestTag}), aborted.`)
      failed()
    }
    console.log(table(commits.map(commit => {
      return [
        `${figures.arrowRight} ${commit.subject}`,
        commit.author.date.toString().gray
      ]
    })))
  } else {
    console.log('It seems to be your first time to publish a new release, not bad.')
  }

  hr('TEST')
  const testCommand = cli.flags.test || kanpai.testScript || config.get('testScript')
  spawn('npm', ['run', testCommand], {stdio: 'inherit'})

  if (!cli.flags.push) {
    hr('VERSION')
    const commitMessage = cli.flags.message || kanpai.commitMessage || config.get('commitMessage')
    spawn('npm', ['version', type, '-m', commitMessage], {stdio: 'inherit'})

    hr('PUBLISH')
    const npmOptions = ['publish']
    if (cli.flags.next) {
      npmOptions.push('--tag', 'next')
    } else if (cli.flags.tag) {
      npmOptions.push('--tag', cli.flags.tag)
    }
    spawn('npm', npmOptions, {stdio: 'inherit'})
  }

  hr('PUSH')
  spawn('git', ['push', '--follow-tags'], {stdio: 'inherit'})

  console.log(`${symbols.success} Everything done!`)
})
