'use strict';

const EventEmitter = require('events');
const path = require('path');
const findProcess = require('find-process');
const Collection = require('@discordjs/collection');

class Monitor extends EventEmitter {
    constructor(dir, names = []) {
        super();

        this.names = new RegExp(names.length > 0 ? `^${names.map(n => `(${n})`).join('|')}$` : '', 'i');
        this.dir = dir ? path.normalize(dir).toLowerCase() : null;
        this.active = new Collection();
        this.interval = null;
    }

    async check() {
        const list = (await findProcess('name', this.names))
            .map(data => ({ ...data, bin: data.bin.toLowerCase(), ts: Date.now() }));

        const matches = this.dir ? list.filter(data => path.dirname(data.bin) === this.dir) : list;
        const closed = this.active.filter(entry => !matches.some(data => data.pid === entry.pid));
        const uncached = matches.filter(data => !this.active.has(data.pid));

        uncached.forEach(data => {
            this.active.set(data.pid, data);
            this.emit('detect', data);
        });

        closed.each(entry => {
            this.active.delete(entry.pid);
            this.emit('kill', entry);
        });
    }

    start() {
        if (this.interval) {
            throw new Error('Monitor already started');
        }

        this.interval = setInterval(() => this.check(), 1000);
        this.emit('start');
    }

    stop() {
        if (!this.interval) {
            throw new Error('Monitor already stopped');
        }

        clearInterval(this.interval);
        this.interval = null;
        this.emit('stop');
    }
}

module.exports = Monitor;
