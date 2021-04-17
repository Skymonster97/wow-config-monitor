'use strict';

class Line {
    constructor(content) {
        this.content = content;

        const pattern = String.raw `(?<command>\w+)\s(?<key>\w+)\s"(?<value>[^"]+)"`;
        const data = new RegExp(pattern).exec(content);

        this.parsed = {
            command: data?.groups?.command ?? null,
            key: data?.groups?.key ?? null,
            value: data?.groups?.value ?? null,
        };
    }

    isComment() {
        return !!this.content?.startsWith('#');
    }

    isFilled() {
        return Object.values(this.toJSON())
            .every(value => value && typeof value === 'string');
    }

    shouldSkip() {
        switch (true) {
            case this.isComment():
            case !this.isFilled():
                return true;
            default:
                return false;
        }
    }

    toJSON() {
        return { command: this.parsed.command, key: this.parsed.key, value: this.parsed.value };
    }

    toString() {
        return `${this.parsed.command} ${this.parsed.key} "${this.parsed.value}"`;
    }

    static toString(command, key, value) {
        return `${command} ${key} "${value}"`;
    }
}

module.exports = Line;
