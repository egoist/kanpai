const spawnSync = require('child_process').spawnSync

module.exports = function () {
	const list = spawnSync('git', ['tag'])
	const tags = list.stdout.toString().trim()
	return (
		tags && tags.split('\n').map(v => v.substr(1))
	) || ['0.0.0']
}
