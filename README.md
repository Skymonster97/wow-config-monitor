<!-- markdownlint-disable no-inline-html header-increment -->
# wow-config-monitor

> Monitoring of World of Warcraft configuration file and restoring user defined settings

### Warning

Author is not responsible for any sort of damages.
Use at your own risk.

### Features

- [x] Supports multiple game instances
- [x] Supports both game folder structures <a id="dir"></a>
- [x] Supports custom game executable names <a id="exec"></a>
- [x] Supports custom game launcher <a id="launcher"></a>

### Usage

Create `wow.profiles.json` <a href="#JSON"><sup>[1]</sup></a> file in the same directory with an application.\
Content of the file must be an array of objects.\
Set up your profile(s) by filling file with data.

#### An example
<!-- https://devdocs.io/node~14_lts/child_process#child_process_child_process_execfile_file_args_options_callback -->
```json
[
  {
    "name": "Legion",
    "directory": "D:/Games/World of Warcraft/Legion",
    "kill": false,
    "launcher": {
      "path": "D:/Games/World of Warcraft/Legion/CustomLauncher.exe",
      "args": ["--custom-argument"],
      "hidden": false,
      "start": true
    },
    "executables": [
      "Wow.exe",
      "Wow-64.exe",
      "WoW-ServerName.exe"
    ],
    "cvars": {
      "gxRefresh": "120",
      "Gamma": "1"
    }
  },
  {
    "name": "WotLK",
    "directory": "D:/Games/World of Warcraft/Wrath of the Lich King",
    "cvars": {
      "realmName": ""
    }
  }
]
```

- **name** - Name of the profile (optional)
- **launcher** - Options for custom launcher (optional) <a href="#launcher"><sup>[2]</sup></a>
  - **path** - Path to the launcher executable (optional)
  - **args** - Command line arguments to pass to the launcher (optional)
  - **hidden** - Whether hide launcher or not (optional)
  - **start** - Whether start launcher or not (optional)
- **directory** - Path to the game directory (optional) <a href="#dir"><sup>[3]</sup></a>
- **executables** - A list of process names to look for (optional) <a href="#exec"><sup>[4]</sup></a>
  > If provided, must be an actual file name of the game, not a launcher that starts `Wow.exe`.\
  > File names `Wow.exe` and `Wow-64.exe` are used by default.
- **cvars** - A list of variables and their values, that are needs to be restored (optional)
- **kill** - Whether close application after closing the game or not (optional)
  - > Not recommended if you have multiple profiles set up

Open application to apply your settings, and keep it open, before closing the game.\
Provided variables will be restored when application starts, and when game closes.

### How to build

> Requires
> **Git** <a href="#Git"><sup>[5]</sup></a>,
> **Node.js** <a href="#Node.js"><sup>[6]</sup></a> and
> **Yarn** <a href="#Yarn"><sup>[7]</sup></a> installed

1. `git clone https://github.com/Skymonster97/wow-config-monitor`
2. `cd wow-config-monitor`
3. `yarn install`
4. `yarn build`

> Output will be in `build/dist` directory

### Links

- [Git](https://git-scm.com/) <a id="Git"></a>
- [Node.js](https://nodejs.org/en/) <a id="Node.js"></a>
- [Yarn](https://yarnpkg.com/) <a id="Yarn"></a>
- [JSON](https://developer.mozilla.org/en-US/docs/Glossary/JSON) <a id="JSON"></a>

## License

[MIT](LICENSE.md) © [Skymonster97](https://github.com/Skymonster97)
