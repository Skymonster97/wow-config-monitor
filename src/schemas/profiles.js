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
    executables: Joi
        .array()
        .items(Joi.string())
        .default([]),
    kill: Joi
        .boolean()
        .default(false),
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
    executables: [
        'Wow.exe',
        'Wow-64.exe',
    ],
    launcher: {
        path: null,
        args: [],
        hidden: false,
        start: true,
    },
    kill: false,
    cvars: {},
};

module.exports = { schema: profiles, defaultProfile };
