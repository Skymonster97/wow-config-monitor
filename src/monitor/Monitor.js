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
        const list = await findProcess('name', this.names);
        const matches = this.dir ? list.filter(data => path.dirname(data.bin).toLowerCase() === this.dir) : list;
        const closed = this.active.filter(entry => !matches.some(data => data.pid === entry.pid));
        const uncached = matches.filter(data => !this.active.has(data.pid));

        uncached.forEach(data => {
            const newData = { ...data, bin: data.bin.toLowerCase() };
            this.active.set(data.pid, newData);
            this.emit('detect', newData);
        });

        closed.each(entry => {
            const newData = { ...entry, bin: entry.bin.toLowerCase() };
            this.active.delete(entry.pid);
            this.emit('kill', newData);
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
