'use strict';

process
    // eslint-disable-next-line no-console
    .on('unhandledRejection', reason => console.error(reason))
    // eslint-disable-next-line no-console
    .on('uncaughtException', error => console.error(error));

const path = require('path');
const fs = require('fs');
const { compile } = require('nexe');
const { copyFile } = require('../src/util/Util.js');
const { fileNames } = require('../src/util/Constants.js');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'build', 'dist');

(async () => {
    const fileName = fileNames.profiles;

    await copyFile({
        filePath: path.join(root, 'src', 'app', fileName),
        dist: path.join(dist, fileName),
    }, { mode: fs.constants.COPYFILE_EXCL }).catch(error => {
        if (error.code === 'EEXIST') {
            // eslint-disable-next-line no-console
            console.log(error.message);
        } else {
            throw error;
        }
    });

    await compile({
        cwd: root,
        loglevel: 'verbose',
        input: './src/app/app.js',
        output: `./build/dist/${fileNames.app}`,
        targets: [
            {
                version: '14.16.1',
                platform: 'win',
                arch: 'x64',
            },
        ],
        build: true,
        enableNodeCli: true,
        resources: [
            //
            './package.json',
        ],
    });
})().then(() => {
    // eslint-disable-next-line no-console
    console.log('\nBuild process complete');
    // eslint-disable-next-line node/no-process-exit
    process.exit(0);
}).catch(error => {
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line node/no-process-exit
    process.exit(0);
});
