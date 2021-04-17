'use strict';

const path = require('path');

module.exports = () => {
    new (require('../util/Logger.js'))({ debug: true }).inject();
    const { keepAlive } = require('../util/Util.js');
    const pkg = require('../../package.json');

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
