'use strict';

const Joi = require('joi');

const entry = Joi.object({
    name: Joi.string().required(),
    directory: Joi.string().required(),
    executables: Joi.array().items(Joi.string().required()).required(),
    cvars: Joi.object().pattern(Joi.string(), Joi.string()).required(),
});

const entries = Joi.array().items(entry.required());

const defaults = [
    {
        name: '',
        directory: '',
        executables: ['Wow.exe', 'Wow-64.exe'],
        cvars: {},
    },
];

module.exports = { schema: entries, defaults };
