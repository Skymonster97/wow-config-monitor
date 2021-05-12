'use strict';

process
    // eslint-disable-next-line no-console
    .on('unhandledRejection', reason => console.error(reason))
    // eslint-disable-next-line no-console
    .on('uncaughtException', error => console.error(error));

require('./setup.js')();

const path = require('path');
const color = require('colorette');
const Parser = require('../parser/Parser.js');
const Monitor = require('../monitor/Monitor.js');
const { fileNames } = require('../util/Constants.js');

const {
    readFile,
    writeFile,
    dirContent,
    safeRequire,
    dirExists,
    fileExists,
    execFile,
    wait,
} = require('../util/Util.js');

const {
    profilesSchema,
    defaultProfile,
} = require('../schemas/profiles.js');

const { underline: _u, cyanBright: _cb } = color;

const resolveGamePath = async (dir, subs = ['_retail_', '_ptr_', '_classic_']) => {
    const { folders } = await dirContent({ dir });
    const sub = Array.isArray(subs)
        ? folders.find(f => subs.includes(f))
        : folders.find(f => f === subs);
    if (sub) return path.join(dir, sub);
    return path.resolve(dir);
};

const createProifle = async (index, data) => {
    const name = data.name ? `${index}:${data.name}` : index;

    const directory = data.directory
        ? await resolveGamePath(data.directory)
        : defaultProfile.directory;

    const executables = data.executables?.length > 0
        ? data.executables
        : defaultProfile.executables;

    const launcher = {
        path: data.launcher?.path ?? defaultProfile.launcher.path,
        args: data.launcher?.args ?? defaultProfile.launcher.args,
        hidden: data.launcher?.hidden ?? defaultProfile.launcher.hidden,
        start: data.launcher?.start ?? defaultProfile.launcher.start,
    };

    const kill = data.kill ?? defaultProfile.kill;
    const cvars = data.cvars ?? defaultProfile.cvars;

    return { name, directory, executables, launcher, kill, cvars };
};

const checkConfig = async (profile, parser, configPath) => {
    const hasCvars = Object.keys(profile.cvars).length > 0;

    if (hasCvars) {
        const configData = await readFile({ filePath: configPath });
        const parsed = parser.parse(configData);

        const changed = Object.entries(profile.cvars).some(([key, value]) => {
            return !parsed.some(line => line.parsed.key === key && line.parsed.value === value);
        });

        if (changed) {
            await writeFile({ filePath: configPath, data: parser.generate(parsed) });
            // eslint-disable-next-line no-console
            console.info(`[${profile.name}] - Config restored`);
        } else {
            // eslint-disable-next-line no-console
            console.debug(`[${profile.name}] - No changes are made; Nothing to change`);
        }
    } else {
        // eslint-disable-next-line no-console
        console.debug(`[${profile.name}] - No changes are made; No cvars provided`);
    }
};

const listen = profile => {
    const parser = new Parser(profile.name, profile.cvars);
    const monitor = new Monitor(profile.directory, profile.executables);

    monitor.on('start', () => {
        // eslint-disable-next-line no-console
        console.info(`[${profile.name}] - Monitoring started`);
    });

    monitor.on('stop', () => {
        // eslint-disable-next-line no-console
        console.info(`[${profile.name}] - Monitoring stopped`);
    });

    monitor.on('detect', processData => {
        // eslint-disable-next-line no-console
        console.info(`[${profile.name}] - Process [${processData.pid}] ${_u(_cb(processData.name))} found`);
    });

    monitor.on('kill', async processData => {
        // eslint-disable-next-line no-console
        console.info(`[${profile.name}] - Process [${processData.pid}] ${_u(_cb(processData.name))} closed`);

        if (monitor.active.some(entry => entry.bin === processData.bin && entry.ts < processData.ts)) {
            // eslint-disable-next-line no-console
            console.debug(`[${profile.name}] - No changes are made; Process is still running under the same directory`);
        } else {
            const configPath = monitor.dir
                ? path.join(monitor.dir, 'WTF', 'Config.wtf')
                : path.join(path.dirname(processData.bin), 'WTF', 'Config.wtf');

            await checkConfig(profile, parser, configPath);

            if (profile.kill) {
                monitor.stop();
                // eslint-disable-next-line node/no-process-exit
                await wait(2000).then(() => process.exit(0));
            }
        }
    });

    return { parser, monitor };
};

(async () => {
    const fileName = fileNames.profiles;
    const profilesPath = path.join(process.appRoot, fileName);
    const profiles = safeRequire(profilesPath, []);

    if (profiles.length === 0) {
        // eslint-disable-next-line no-console
        console.warn('No profiles found; Running in listen only mode');
        const { monitor } = listen({ ...defaultProfile, name: 'GLOBAL' });
        monitor.start();
        return;
    }

    await profilesSchema.validateAsync(profiles).catch(error => {
        throw error.details;
    });

    let counter = 0;
    const used = new Set();

    const handleProfile = async (index, data) => {
        if (Object.keys(data).length > 0) {
            if (data.directory) {
                if (await dirExists({ dir: data.directory })) {
                    const gamePath = path.normalize(data.directory);
                    if (used.has(gamePath)) {
                        counter++;
                        // eslint-disable-next-line no-console
                        console.warn(`Profile [${index}] skipped; Duplicate directory provided`);
                    } else {
                        used.add(gamePath);
                        const profile = await createProifle(index, data);

                        const start = async () => {
                            const { monitor, parser } = listen(profile);
                            const configPath = path.join(monitor.dir, 'WTF', 'Config.wtf');
                            await checkConfig(profile, parser, configPath);
                            monitor.start();
                        };

                        if (profile.launcher.start && profile.launcher.path) {
                            if (await fileExists({ dir: profile.launcher.path })) {
                                await start();

                                const { dir, base } = path.parse(profile.launcher.path);
                                // eslint-disable-next-line no-console
                                console.info(`[${profile.name}] - Starting "${base}"`);
                                await execFile(
                                    { fileName: base, args: profile.launcher.args },
                                    { cwd: dir, windowsHide: profile.launcher.hidden },
                                );
                            } else {
                                counter++;
                                // eslint-disable-next-line no-console
                                console.warn(`Profile [${index}] skipped; Invalid launcher path provided`);
                            }
                        } else {
                            await start();
                        }
                    }
                } else {
                    counter++;
                    // eslint-disable-next-line no-console
                    console.warn(`Profile [${index}] skipped; Invalid game directory provided`);
                }
            } else if (data.cvars ? Object.keys(data.cvars).length === 0 : false) {
                counter++;
                // eslint-disable-next-line no-console
                console.warn(`Profile [${index}] skipped; No cvars provided`);
            } else {
                counter++;
                // eslint-disable-next-line no-console
                console.warn(`Profile [${index}] skipped; No directory provided`);
            }
        } else {
            counter++;
            // eslint-disable-next-line no-console
            console.warn(`Profile [${index}] skipped; Empty profile provided`);
        }
    };

    for (const [index, data] of profiles.entries()) {
        // eslint-disable-next-line no-await-in-loop
        await handleProfile(index, data);
    }

    if (counter === profiles.length) {
        // eslint-disable-next-line no-console
        console.warn('No valid profiles found; Running in listen only mode');
        used.clear();
        const { monitor } = listen({ ...defaultProfile, name: 'GLOBAL' });
        monitor.start();
    }
})();
