'use strict';

process
    // eslint-disable-next-line no-console
    .on('unhandledRejection', reason => console.error(reason))
    // eslint-disable-next-line no-console
    .on('uncaughtException', error => console.error(error));

require('./setup.js')();

const path = require('path');
const Parser = require('../parser/Parser.js');
const Monitor = require('../monitor/Monitor.js');
const { writeFile, resolveGamePath, safeRequire } = require('../util/Util.js');
const { schema, defaults } = require('../schemas/profiles.js');

(async () => {
    const fileName = 'wow.profiles.json';
    const profilesPath = path.join(process.appRoot, fileName);
    let profiles = safeRequire(profilesPath);

    if (!profiles) {
        await writeFile({
            filePath: profilesPath,
            data: JSON.stringify(defaults, null, 2),
        }, { flag: 'wx' });

        profiles = defaults;
    }

    await schema.validateAsync(profiles).catch(error => {
        throw error.details;
    });

    profiles.forEach(async (entry, index) => {
        const gamePath = await resolveGamePath(entry.directory);
        const gameConfig = path.join(gamePath, 'WTF', 'Config.wtf');

        const parser = new Parser(gameConfig, entry.name ?? index, entry.cvars);
        const monitor = new Monitor(entry.executables, entry.directory);

        monitor.on('start', () => { // eslint-disable-next-line no-console
            console.info(`${entry.name} - Monitoring started`);
        });

        monitor.on('stop', () => { // eslint-disable-next-line no-console
            console.info(`${entry.name} - Monitoring stopped`);
        });

        monitor.on('detect', data => { // eslint-disable-next-line no-console
            console.info(`${entry.name} - Process [${data.pid}] "${data.name}" found`);
        });

        monitor.on('kill', async data => { // eslint-disable-next-line no-console
            console.info(`${entry.name} - Process [${data.pid}] "${data.name}" closed`);

            await writeFile({
                filePath: parser.filePath,
                data: await parser.generate(),
            });
            // eslint-disable-next-line no-console
            console.info(`${entry.name} - Changes saved`);
        });

        monitor.start();
    });
})();
