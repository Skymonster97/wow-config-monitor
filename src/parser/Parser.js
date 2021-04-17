'use strict';

const path = require('path');
const Line = require('./Line.js');
const { readFile, newLine } = require('../util/Util.js');

class Parser {
    constructor(filePath, name, cvars) {
        this.filePath = path.resolve(filePath);
        this.name = name;
        this.cvars = cvars;
    }

    replace(lines) {
        const entries = Object.entries(this.cvars);

        entries.forEach(([key, value]) => {
            const line = lines.find(l => l.parsed.key === key);

            if (line) {
                const oldVal = line.parsed.value;
                if (Object.is(oldVal, value)) return;
                line.parsed.value = value;
                // eslint-disable-next-line no-console
                console.debug(`${this.name} - Prop restored ${key} "${oldVal}" -> "${value}"`);
            } else {
                lines.push(new Line(Line.toString('SET', key, value)));
                // eslint-disable-next-line no-console
                console.debug(`${this.name} - Prop added ${key} "${value}"`);
            }
        });

        return lines;
    }

    async parse() {
        const file = await readFile({ filePath: this.filePath, wait: 15 * 1000 });
        const entries = file.split(newLine);
        const parsed = entries.map(entry => new Line(entry));
        const lines = parsed.filter(line => !line.shouldSkip());
        console.debug(`${this.name} - Config parsed`); // eslint-disable-line no-console
        return lines;
    }

    async generate() {
        const lines = await this.parse();
        const fixed = this.replace(lines);
        const content = fixed.map(line => line.toString()).join('\r\n');
        console.debug(`${this.name} - Config generated`); // eslint-disable-line no-console
        return content;
    }
}

module.exports = Parser;
