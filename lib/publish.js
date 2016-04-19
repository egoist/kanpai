'use strict'

const spawnSync = require('cross-spawn').sync
const symbols = require('log-symbols')
const cwd = require('cwd')
const figures = require('figures')

function hr(text) {
	const char = figures.pointer.cyan
	console.log(`${char.repeat(5)} ${text}`)
}

function spawn() {
	const command = spawnSync.apply(null, arguments)
	const hasError = command.status !== 0
		|| (command.stderr && command.stderr.toString().trim())
		|| command.signal === 'SIGINT'
	if (hasError) {
		let errorMessage = command.error && command.error.message
		if (command.stderr && command.stderr.toString().trim()) {
			errorMessage = command.stderr.toString()
		}
		if (command.signal === 'SIGINT') {
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
