'use strict'

const command = process.argv.slice(2).join(' ')
if(!command.length)
    throw new Error('No command specified')

const execSync = require('child_process').execSync

const xvfb = new (require('xvfb'))({silent: true, timeout: 1000})

try {
    xvfb.startSync()
}
catch(err) {
    console.warn(err)
    xvfb.stopSync()
}
try {
    execSync(command, {stdio: 'inherit'})
}
finally {
    xvfb.stopSync()
}
