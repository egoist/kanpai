'use strict'

const semver = require('semver')
const isSemver = require('is-semver')
const spawnSync = require('child_process').spawnSync
const versions = require('./versions')

function hr(text, width, char) {
	width = width || 15
	char = char || '🍻'
	const length = (width - text.length) / 2
	console.log(`${char.repeat(length)}  ${text} ${char.repeat(length)}`.green)
}

function spawn() {
	const command = spawnSync.apply(null, arguments)
	if (command.status === 1) {
		if (command.stderr) {
			console.log(command.stderr.toString())
		}
		console.log(`❌  Failed to publish new version.`.red)
		process.exit(1)
	} else {
		return command
	}
}

module.exports = function (type) {
	hr('TEST')
	spawn('npm', ['test'], {stdio: 'inherit'})

	hr('VERSIONING')
	const version = versions().pop()
	spawn('npm', ['version', version])
	spawn('npm', ['version', type], {stdio: 'inherit'})
	const nextVersion = isSemver(type) ? type : semver.inc(version, type)

	hr('PUBLISH')
	spawn('npm', ['publish'])

	hr('PUSHING')
	spawn('npm', ['version', '0.0.0-kanpai'])
	spawn('git', ['tag', '-a', `v${nextVersion}`, '-m', `Version ${nextVersion}`])
	spawn('git', ['push', 'origin', 'master', '--follow-tags'])

	console.log(`🔥  Everything done!`.green)
}
