import { execSync } from 'child_process';
import XVFB from 'xvfb';

const command = process.argv.slice(2).join(' ');
if (!command.length) {
    throw new Error('No command specified');
}

const buf = new XVFB({ silent: true, timeout: 1000 });

try {
    buf.startSync();
} catch (err) {
    console.warn(err);
    buf.stopSync();
}
try {
    execSync(command, { stdio: 'inherit' });
} finally {
    buf.stopSync();
}
