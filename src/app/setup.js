'use strict';

const path = require('path');
const { keepAlive, safeRequire } = require('../util/Util.js');
const { fileNames } = require('../util/Constants.js');
const Logger = require('../util/Logger.js');
const pkg = require('../../package.json');

module.exports = () => {
    // eslint-disable-next-line node/no-process-env
    const env = process.env.NODE_ENV = process.__nexe
        ? 'production'
        : 'development';

    const root = process.appRoot = env === 'production'
        ? path.join(__dirname, '../..')
        : path.join(__dirname);

    const levels = safeRequire(path.join(root, fileNames.logger), {});
    const logger = new Logger(levels);

    logger.inject();

    if (env === 'production') {
        process.title = `[ ${pkg.name} ]`;

        keepAlive();
    }
};
