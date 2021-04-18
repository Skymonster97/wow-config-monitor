'use strict';

const { existsSync, promises } = require('fs');
const { readFile, readdir, copyFile, mkdir, writeFile } = promises;
const path = require('path');
const AbortController = require('node-abort-controller');

class Util {
    static newLine = /\r\n|\r|\n/;

    constructor() {
        throw new Error('Initialization is not allowed');
    }

    static safeRequire(id) {
        try {
            return require(id);
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                return null;
            }
            throw error;
        }
    }

    static abort(fn, wait = 10 * 1000) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const timeout = new Error(`Timeout:${wait}`);
            controller.signal.addEventListener('abort', () => reject(timeout));
            fn().then(resolve).catch(reject);
            setTimeout(() => controller.abort(), wait);
        });
    }

    static cleanObject(obj) {
        return Object.assign(Object.create(null), obj);
    }

    static readFile(options = {}, native = {}) {
        const { filePath, wait = 10 * 1000 } = options;
        return Util.abort(() => readFile(filePath, { encoding: 'utf-8', ...native }), wait);
    }

    static writeFile(options = {}, native = {}) {
        const { filePath, data, wait = 10 * 1000 } = options;
        return Util.abort(() => writeFile(filePath, data, { flag: 'w', ...native }), wait);
    }

    static copyFile(options = {}, mode = 0) {
        const { filePath, dist, wait = 10 * 1000 } = options;
        return Util.abort(async () => {
            const dirname = path.dirname(dist);
            if (!existsSync(dirname)) await mkdir(dirname, { recursive: true });
            return copyFile(filePath, dist, mode);
        }, wait);
    }

    static dirContent(dir) {
        return readdir(path.resolve(dir), { withFileTypes: true }).then(dirents => [
            dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name),
            dirents.filter(dirent => dirent.isFile()).map(dirent => dirent.name),
        ]);
    }

    static async resolveGamePath(dir, custom = ['_retail_', '_ptr_', '_classic_']) {
        const [folders] = await Util.dirContent(path.resolve(dir));
        const prefix = Array.isArray(custom) ? folders.find(f => custom.includes(f)) : folders.includes(custom);
        if (prefix) return path.join(dir, prefix);
        return path.resolve(dir);
    }

    // eslint-disable-next-line require-await
    static async keepAlive() {
        // eslint-disable-next-line no-bitwise
        return setInterval(() => null, 1 << 30);
    }
}

module.exports = Util;
