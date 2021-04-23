'use strict';

const Joi = require('joi');

const profile = Joi.object({
    name: Joi
        .string()
        .allow('')
        .default(''),
    launcher: Joi
        .object({
            path: Joi
                .string()
                .allow('')
                .default(''),
            args: Joi
                .array()
                .items(Joi.string())
                .default([]),
            hidden: Joi
                .boolean()
                .default(false),
            start: Joi
                .boolean()
                .default(false),
        })
        .default({}),
    kill: Joi
        .boolean()
        .default(false),
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
    launcher: {
        path: null,
        args: [],
        hidden: false,
        start: true,
    },
    kill: false,
    directory: null,
    executables: ['Wow.exe', 'Wow-64.exe'],
    cvars: {},
};

module.exports = { schema: profiles, defaultProfile };
