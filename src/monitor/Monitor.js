'use strict';

const EventEmitter = require('events');
const path = require('path');
const findProcess = require('find-process');
const Collection = require('@discordjs/collection');

class Monitor extends EventEmitter {
    constructor(names, dir) {
        super();

        this.names = new RegExp(names.map(n => `(${n})`).join('|'), 'i');
        this.dir = path.normalize(dir);
        this.active = new Collection();
        this.interval = null;
    }

    async check() {
        const list = await findProcess('name', this.names);
        const matches = list.filter(data => path.dirname(data.bin) === this.dir);

        this.active
            .filter(entry => !matches.some(data => data.pid === entry.pid))
            .each(entry => {
                this.active.delete(entry.pid);
                this.emit('kill', entry);
            });

        matches.forEach(data => {
            if (!this.active.has(data.pid)) {
                this.active.set(data.pid, data);
                this.emit('detect', data);
            }
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
