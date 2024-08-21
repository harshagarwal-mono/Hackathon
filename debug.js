/* eslint-disable import/no-extraneous-dependencies */
const runAll = require('npm-run-all');
const path = require('path');
/* eslint-enable import/no-extraneous-dependencies */

const bundlePath = path.resolve(__dirname, 'bundle', 'dist', 'main.bundle.js');

const run = () => {
    runAll([
        'debug-run -- {@}',
    ], {
        printName: true,
        stdout: process.stdout,
        stderr: process.stderr,
        arguments: [
           bundlePath,
        ],
    }).then(console.log).catch(console.log);
};

run();

module.exports = {
    run,
};
