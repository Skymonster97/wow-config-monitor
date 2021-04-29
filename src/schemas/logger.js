'use strict';

const Joi = require('joi');

const defaults = {
    debug: false,
    info: true,
    log: true,
    warn: true,
    error: true,
};

const levelsSchema = Joi.object({
    debug: Joi
        .boolean()
        .default(defaults.debug),
    info: Joi
        .boolean()
        .default(defaults.info),
    log: Joi
        .boolean()
        .default(defaults.log),
    warn: Joi
        .boolean()
        .default(defaults.warn),
    error: Joi
        .boolean()
        .default(defaults.error),
});

module.exports = { levelsSchema, defaultLevels: defaults };
