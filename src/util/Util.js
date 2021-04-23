'use strict';

const { promises } = require('fs');
const { readFile, readdir, copyFile, mkdir, writeFile, access } = promises;
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
            Promise.resolve(fn(resolve, reject)).then(resolve).catch(reject);
            setTimeout(() => controller.abort(), wait);
        });
    }

    static cleanObject(obj = {}) {
        return Object.assign(Object.create(null), obj);
    }

    static readFile(options = {}, nativeOptions = {}) {
        const { filePath, wait } = options;
        return Util.abort(() => readFile(filePath, { encoding: 'utf-8', ...nativeOptions }), wait);
    }

    static writeFile(options = {}, nativeOptions = {}) {
        const { filePath, data, wait } = options;
        return Util.abort(() => writeFile(filePath, data, { flag: 'w', ...nativeOptions }), wait);
    }

    static copyFile(options = {}, nativeOptions = {}) {
        const { filePath, dist, wait } = options;
        const { mode = 0 } = nativeOptions;
        const dirname = path.dirname(dist);
        return Util.abort(() => {
            return Util.dirExists({ dir: dirname, wait }).then(async exists => {
                if (!exists) await mkdir(dirname, { recursive: true });
                return copyFile(filePath, dist, mode);
            });
        }, wait);
    }

    static dirContent(options = {}, nativeOptions = {}) {
        const { dir, wait } = options;
        return Util.abort(() => {
            return readdir(path.resolve(dir), { withFileTypes: true, ...nativeOptions }).then(dirents => [
                dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name),
                dirents.filter(dirent => dirent.isFile()).map(dirent => dirent.name),
            ]);
        }, wait);
    }

    static dirExists(options = {}, nativeOptions = {}) {
        const { dir, wait } = options;
        const { mode } = nativeOptions;
        return Util.abort((resolve, reject) => {
            return access(dir, mode).then(() => resolve(true)).catch(e => {
                return e.code === 'ENOENT' ? resolve(false) : reject(e);
            });
        }, wait);
    }

    static async resolveGamePath(dir, subs = ['_retail_', '_ptr_', '_classic_']) {
        const [folders] = await Util.dirContent({ dir });
        const sub = Array.isArray(subs) ? folders.find(f => subs.includes(f)) : folders.find(f => f === subs);
        if (sub) return path.join(dir, sub);
        return path.resolve(dir);
    }

    // eslint-disable-next-line require-await
    static async keepAlive() {
        // eslint-disable-next-line no-bitwise
        return setInterval(() => null, 1 << 30);
    }
}

module.exports = Util;
