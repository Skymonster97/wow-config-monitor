'use strict';

const { promisify } = require('util');
const { execFile } = require('child_process');
const { promises: { readFile, readdir, copyFile, mkdir, writeFile, stat, access } } = require('fs');
const path = require('path');

const execFileAsync = promisify(execFile);

class Util {
    static newLine = /\r\n|\r|\n/;

    constructor() {
        throw new Error('Initialization is not allowed');
    }

    static safeRequire(id) {
        try {
            return require(id);
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') return null;
            throw error;
        }
    }

    static cleanObject(obj = {}) {
        return Object.assign(Object.create(null), obj);
    }

    static execFile(options = {}, nativeOptions = {}) {
        const { fileName, args = [] } = options;
        return execFileAsync(fileName, args, nativeOptions);
    }

    static readFile(options = {}, nativeOptions = {}) {
        const { filePath } = options;
        return readFile(filePath, { encoding: 'utf-8', ...nativeOptions });
    }

    static writeFile(options = {}, nativeOptions = {}) {
        const { filePath, data } = options;
        return writeFile(filePath, data, { flag: 'w', ...nativeOptions });
    }

    static async copyFile(options = {}, nativeOptions = {}) {
        const { filePath, dist } = options;
        const { mode = 0 } = nativeOptions;
        const dir = path.dirname(dist);
        const exists = await Util.dirExists({ dir });
        if (!exists) await mkdir(dir, { recursive: true });
        return copyFile(filePath, dist, mode);
    }

    static async dirContent(options = {}, nativeOptions = {}) {
        const { dir } = options;
        const dirents = await readdir(dir, { withFileTypes: true, ...nativeOptions });
        const folders = dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
        const files = dirents.filter(dirent => dirent.isFile()).map(dirent => dirent.name);
        return { folders, files };
    }

    static dirExists(options = {}, nativeOptions = {}) {
        const { dir } = options;
        const { mode } = nativeOptions;
        return access(dir, mode)
            .then(async () => (await stat(dir)).isDirectory())
            .catch(e => e.code === 'ENOENT' ? false : e);
    }

    static fileExists(options = {}, nativeOptions = {}) {
        const { dir } = options;
        const { mode } = nativeOptions;
        return access(dir, mode)
            .then(async () => (await stat(dir)).isFile())
            .catch(e => e.code === 'ENOENT' ? false : e);
    }

    static async resolveGamePath(dir, subs = ['_retail_', '_ptr_', '_classic_']) {
        const { folders } = await Util.dirContent({ dir });
        const sub = Array.isArray(subs)
            ? folders.find(f => subs.includes(f))
            : folders.find(f => f === subs);
        if (sub) return path.join(dir, sub);
        return path.resolve(dir);
    }

    static wait(time = 0) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    // eslint-disable-next-line require-await
    static async keepAlive() {
        // eslint-disable-next-line no-bitwise
        return setInterval(() => null, 1 << 30);
    }
}

module.exports = Util;
