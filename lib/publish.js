'use strict'

const spawnSync = require('child_process').spawnSync

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
	spawn('npm', ['version', type], {stdio: 'inherit'})

	hr('PUBLISH')
	spawn('npm', ['publish'], {stdio: 'inherit'})

	hr('PUSHING')
	spawn('git', ['push', 'origin', 'master', '--follow-tags'])

	console.log(`🔥  Everything done!`.green)
}
