'use strict';

const Joi = require('joi');

const profile = Joi.object({
    name: Joi
        .string()
        .allow('')
        .default(''),
    directory: Joi
        .string()
        .allow('')
        .default(''),
    executables: Joi
        .array()
        .items(Joi.string())
        .default([]),
    cvars: Joi
        .object()
        .pattern(Joi.string(), Joi.string().allow(''))
        .default({}),
});

const profiles = Joi
    .array()
    .items(profile);

const defaultProfile = {
    name: null,
    directory: null,
    executables: ['Wow.exe', 'Wow-64.exe'],
    cvars: {},
};

module.exports = { schema: profiles, defaultProfile };
