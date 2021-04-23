'use strict';

const { Console } = require('console');
const color = require('colorette');
const moment = require('moment');
const { cleanObject } = require('./Util.js');

class Logger {
    constructor(levels = {}, consoleOptions = {}) {
        const types = cleanObject({
            debug: { enabled: false, color: 'gray' },
            info: { enabled: true, color: 'blueBright' },
            log: { enabled: true, color: 'green' },
            warn: { enabled: true, color: 'yellow' },
            error: { enabled: true, color: 'red' },
        });

        Reflect.defineProperty(this, 'types', {
            value: Object.assign(types, Object.fromEntries(
                Object.entries(levels).filter(([key]) => key in types).map(([key, value]) => {
                    return [key, { enabled: !!value, color: types[key].color }];
                }),
            )),
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
