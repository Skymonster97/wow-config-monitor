'use strict';

const Joi = require('joi');

const defaults = {
    name: null,
    directory: null,
    launcher: {
        path: null,
        args: [],
        hidden: false,
        start: true,
    },
    executables: [
        'Wow.exe',
        'Wow-64.exe',
    ],
    kill: false,
    cvars: {},
};

const profileSchema = Joi.object({
    name: Joi
        .string()
        .allow('')
        .default(defaults.name),
    directory: Joi
        .string()
        .allow('')
        .default(defaults.directory),
    launcher: Joi
        .object({
            path: Joi
                .string()
                .allow('')
                .default(defaults.launcher.path),
            args: Joi
                .array()
                .items(Joi.string())
                .default(defaults.launcher.args),
            hidden: Joi
                .boolean()
                .default(defaults.launcher.hidden),
            start: Joi
                .boolean()
                .default(defaults.launcher.start),
        })
        .default(defaults.launcher),
    executables: Joi
        .array()
        .items(Joi.string())
        .default(defaults.executables),
    kill: Joi
        .boolean()
        .default(defaults.kill),
    cvars: Joi
        .object()
        .pattern(Joi.string(), Joi.string().allow(''))
        .default(defaults.cvars),
});

const profilesSchema = Joi
    .array()
    .items(profileSchema);

module.exports = { profilesSchema, defaultProfile: defaults };
