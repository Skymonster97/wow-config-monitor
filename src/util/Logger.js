'use strict';

const { Console } = require('console');
const color = require('colorette');
const moment = require('moment');
const { cleanObject } = require('./Util.js');
const { defaultLevels: dl } = require('../schemas/logger.js');

class Logger {
    constructor(levels = {}, consoleOptions = {}) {
        const types = cleanObject({
            debug: { enabled: dl.debug, color: 'gray' },
            info: { enabled: dl.info, color: 'blueBright' },
            log: { enabled: dl.log, color: 'green' },
            warn: { enabled: dl.warn, color: 'yellow' },
            error: { enabled: dl.error, color: 'red' },
        });

        const format = ([key, value]) => [key, { enabled: !!value, color: types[key].color }];
        const output = Object.entries(levels).filter(([key]) => key in types).map(format);

        Reflect.defineProperty(this, 'types', {
            value: Object.assign(types, Object.fromEntries(output)),
        });

        Reflect.defineProperty(this, 'console', {
            value: new Console({
                stdout: process.stdout,
                stderr: process.stderr,
                inspectOptions: {
                    depth: null,
                    maxArrayLength: 500,
                },
                ...consoleOptions,
            }),
        });
    }

    print(type, args) {
        const timeTag = `${color.gray(color.underline(moment().format('YYYY-MM-DD/HH:mm:ss')))}`;
        const typeTag = `${color.underline(color[this.types[type].color](type.toUpperCase()))}`;

        this.console[type](`[${timeTag}]:[${typeTag}] »`, ...args);
    }

    inject() {
        /* eslint-disable no-console */
        if (console._original) {
            throw new Error('Logger was already injected');
        }

        console._original = {};

        Object.keys(this.types).forEach(type => {
            console._original[type] = console[type];

            console[type] = this._wrap(
                (...args) => this.types[type].enabled ? this.print(type, args) : null,
            );
        });
        /* eslint-enable no-console */
    }

    _wrap(func) {
        return (...args) => {
            Reflect.apply(func, undefined, args);
        };
    }
}

module.exports = Logger;
