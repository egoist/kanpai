'use strict'

const spawnSync = require('child_process').spawnSync
const fancyHr = require('fancy-hr')

function hr(text) {
	text = '  ' + text + ' '
	console.log(fancyHr(text, 15, '🍻'))
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
	spawn('npm', ['version', type], {stdio: 'inherit'})

	hr('PUBLISH')
	spawn('npm', ['publish'], {stdio: 'inherit'})

	hr('PUSHING')
	spawn('git', ['push', 'origin', 'master', '--follow-tags'], {stdio: 'inherit'})

	console.log('🔥  Everything done!')
}
