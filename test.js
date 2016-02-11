const spawnSync = require('child_process').spawnSync

const a = spawnSync('git', ['tag'])
console.log(a.stdout.toString().trim() && a.stdout.toString().trim().split('\n').map(v => v.substr(1)))
