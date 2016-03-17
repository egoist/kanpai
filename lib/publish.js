'use strict'

const os = require('os')
const spawnSync = require('child_process').spawnSync
const fancyHr = require('fancy-hr')
const symbols = require('log-symbols')
const cwd = require('cwd')

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

function readCwdPkg() {
	const holder = {kanpai: {}}
	try {
		const pkg = require(cwd('package.json'))
		return (pkg && pkg.kanpai) || holder
	} catch (e) {
		return holder
	}
}

module.exports = function (type, cli) {
	const config = readCwdPkg()

	hr('TEST')
	const testCommand = cli.flags.test || config.test || 'test'
	spawn('npm', ['run', testCommand], {stdio: 'inherit'})

	if (!cli.flags.push) {
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
