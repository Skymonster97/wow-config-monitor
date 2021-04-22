'use strict';

const color = require('colorette');
const Line = require('./Line.js');
const { newLine } = require('../util/Util.js');

const { underline: _u, cyanBright: _cb, red: _r, green: _g } = color;

class Parser {
    constructor(name, cvars) {
        this.name = name;
        this.cvars = cvars;
    }

    replace(lines) {
        const entries = Object.entries(this.cvars);

        entries.forEach(([key, value]) => {
            const line = lines.find(l => l.parsed.key === key);

            if (line) {
                const oldVal = line.parsed.value;

                if (!Object.is(oldVal, value)) {
                    line.parsed.value = value;
                    // eslint-disable-next-line no-console
                    console.debug(`[${this.name}] - Prop restored ${_u(_cb(key))} ${_u(_r(oldVal))} -> ${_u(_g(value))}`);
                }
            } else {
                lines.push(Line.construct('SET', key, value));
                // eslint-disable-next-line no-console
                console.debug(`[${this.name}] - Prop added ${_u(_cb(key))} ${_u(_g(value))}`);
            }
        });

        return lines;
    }

    parse(data) {
        const entries = data.split(newLine);
        const parsed = entries.map(entry => new Line(entry));
        const lines = parsed.filter(line => !line.shouldSkip());
        console.debug(`[${this.name}] - Config parsed`); // eslint-disable-line no-console
        return lines;
    }

    generate(lines) {
        const fixed = this.replace(lines);
        const content = fixed.map(line => line.toString()).join('\r\n');
        console.debug(`[${this.name}] - Config generated`); // eslint-disable-line no-console
        return content;
    }
}

module.exports = Parser;
