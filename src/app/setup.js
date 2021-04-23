'use strict';

const path = require('path');
const { keepAlive } = require('../util/Util.js');
const Logger = require('../util/Logger.js');
const pkg = require('../../package.json');

module.exports = () => {
    new Logger({ debug: true }).inject();

    // eslint-disable-next-line node/no-process-env
    const env = process.env.NODE_ENV = process.__nexe ? 'production' : 'development';

    if (env === 'production') {
        process.appRoot = path.join(__dirname, '../..');
        process.title = `[ ${pkg.name} ]`;

        keepAlive();
    } else {
        process.appRoot = path.join(__dirname);
    }
};
