'use strict'

const os = require('os')
const spawnSync = require('child_process').spawnSync
const fancyHr = require('fancy-hr')
const symbols = require('log-symbols')

function hr(text) {
	text = '  ' + text + ' '
	const char = os.platform() === 'darwin' ? '🍻' : '-'
	console.log(fancyHr(text, 15, char))
}

function spawn() {
	const command = spawnSync.apply(null, arguments)
	if (command.status === 1) {
		if (command.stderr) {
			console.log(command.stderr.toString())
		}
		console.log(`${symbols.error} Failed to publish new version.`.red)
		process.exit(1)
	} else {
		return command
	}
}

module.exports = function (type, argv) {
	hr('TEST')
	const testCommand = argv.test ? ['run', argv.test] : ['test']
	spawn('npm', testCommand, {stdio: 'inherit'})

	if (!argv['push-only']) {
		hr('VERSION')
		spawn('npm', ['version', type], {stdio: 'inherit'})

		hr('PUBLISH')
		spawn('npm', ['publish'], {stdio: 'inherit'})
	}

	hr('PUSH')
	var currentBranch = spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.toString().trim()
	spawn('git', ['push', 'origin', currentBranch, '--follow-tags'], {stdio: 'inherit'})

	console.log(`${symbols.success} Everything done!`)
}
