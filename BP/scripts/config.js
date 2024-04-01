import { system, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { Database } from "./utils/database";
function configDefault() {
    return {
        objective: "money",
        currency: "$",
        command_prefix: "+",
        rank: {
            default_rank: {
                name: "Member",
                rank: {
                    name: "§8⌈§r {rank} §r§8⌋§r §d{player}",
                    chat: "§8⟨§r{rank}§8⟩§r {player} §r§7»§r §a{chat}",
                    display: "§aMember",
                    permissions: [],
                },
            },
        },
        join: {
            title: "§l§2Welcome",
            subtitle: "§d{player}"
        },
        clans: {
            clan_name: "§b⟨§r§e{clan}§r§b⟩",
            clan_chat: "§7[§e{clan}§7]§r",
            timeout: 3,
        },
        navigation: {
            title: "§l§bPortal§dUI",
            description: "Hello {player}!",
            button: "§2{button}§r\n§8[ Click Me! OwO ]"
        },
        sell: {
            selluimenu: false,
        },
        warp: {
            timeout: 3,
        },
        home: {
            timeout: 3,
            normal_homelimits: 5,
        },
        texter: {
            time: 4,
        },
        randomtp: {
            rtpuimenu: true,
            timeout: 90,
            minY: 60,
            minRange: 1000,
            maxRange: 6000,
        },
    };
}
export let config = configDefault();
export var Config;
(function (Config) {
    function setConfigUI(player, path = "") {
        const array = getArray(config, path);
        const arrayDefault = getArray(configDefault(), path);
        if (typeof array === "object" || typeof array === "undefined") {
            const form = new ActionFormData();
            form.title(`§2Config§dUI`);
            let keys = [];
            if (typeof array === "undefined") {
                form.body(`config: §a${(JSON.stringify(config, undefined, 4)).replace(/"/g, `§r§a"`)}§r\npath: §econfig`);
                keys = Object.keys(config);
            }
            else {
                form.body(`data: §a${JSON.stringify(array, undefined, 4).replace(/"/g, `§r§a"`)}§r\npath: §e${path}`);
                keys = Object.keys(array);
            }
            for (const key of keys) {
                form.button(`§d${key}§r\n§bClick To Edit`);
            }
            form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
            form.show(player).then((res) => {
                if (res.canceled || res.selection === undefined)
                    return;
                let newpath = path.split(".");
                if (res.selection === keys.length) {
                    if (path === "")
                        return;
                    newpath.pop();
                    let _newpath = newpath.join(".");
                    if (_newpath.startsWith("."))
                        _newpath = _newpath.substring(1);
                    if (_newpath.endsWith("."))
                        _newpath = _newpath.substring(0, _newpath.length - 2);
                    world.sendMessage(_newpath);
                    setConfigUI(player, _newpath);
                    return;
                }
                newpath.push(keys[res.selection]);
                let _newpath = newpath.join(".");
                if (_newpath.startsWith("."))
                    _newpath = _newpath.substring(1);
                if (_newpath.endsWith("."))
                    _newpath = _newpath.substring(0, _newpath.length - 2);
                world.sendMessage(_newpath);
                setConfigUI(player, _newpath);
            });
        }
        if (typeof array === "string") {
            const form = new ModalFormData();
            form.title(`§2Config§dUI`);
            form.textField(`§a- Default:§r ${arrayDefault}§r\n§a- Data:§r ${array}§r\n§a- Path:§e ${path}§r\n\nValue (string)`, array);
            form.show(player).then((res) => {
                if (res.canceled || res.formValues === undefined)
                    return;
                if (res.formValues[0] === "") {
                    player.sendMessage(`[Config] §cNo Value!`);
                    return;
                }
                player.sendMessage(`[Config] §aSuccess to set!`);
                setConfig(path, res.formValues[0].toString().replace(/\\n/g, "\n"));
            });
        }
        if (typeof array === "number") {
            const form = new ModalFormData();
            form.title(`§2Config§dUI`);
            form.textField(`§a- Default:§r ${arrayDefault}§r\n§a- Data:§r ${array}§r\n§a- Path:§e ${path}§r\n\nValue (number)`, `${array}`);
            form.show(player).then((res) => {
                if (res.canceled || res.formValues === undefined)
                    return;
                if (Number.isNaN(res.formValues[0])) {
                    player.sendMessage(`[Config] §cInvalid number!`);
                    return;
                }
                player.sendMessage(`[Config] §aSuccess to set!`);
                setConfig(path, Number(res.formValues[0]));
            });
        }
        if (typeof array === "boolean") {
            const form = new ModalFormData();
            form.title(`§2Config§dUI`);
            form.toggle(`§a- Default:§r ${arrayDefault}§r\n§a- Data:§r ${array}§r\n§a- Path:§e ${path}§r\n\nValue (boolean)`, array);
            form.show(player).then((res) => {
                if (res.canceled || res.formValues === undefined)
                    return;
                player.sendMessage(`[Config] §aSuccess to set!`);
                setConfig(path, res.formValues[0]);
            });
        }
    }
    Config.setConfigUI = setConfigUI;
    function setConfig(path, value) {
        system.run(() => {
            setArray(config, path, value);
            Database.set("candra:config", config);
            updateConfig();
        });
    }
    Config.setConfig = setConfig;
    function updateConfig() {
        let data = Database.get("candra:config");
        if (typeof data === "undefined") {
            Database.set("candra:config", configDefault());
            config = configDefault();
            return;
        }
        else {
            fixConfig();
        }
        config = data;
    }
    Config.updateConfig = updateConfig;
    function fixConfig(path = "") {
        if (path === "") {
            for (const key of Object.keys(configDefault())) {
                fixConfig(key);
            }
            return;
        }
        const array = getArray(config, path);
        const defaultArray = getArray(configDefault(), path);
        if (typeof array === "undefined" && typeof defaultArray !== "undefined" || typeof array !== typeof defaultArray) {
            setConfig(path, defaultArray);
            return;
        }
        if (typeof array === "object") {
            for (const key of Object.keys(defaultArray)) {
                let newPath = path + "." + key;
                if (newPath.startsWith("."))
                    newPath = newPath.substring(1);
                if (newPath.endsWith("."))
                    newPath = newPath.substring(0, newPath.length - 2);
                fixConfig(newPath);
            }
            return;
        }
    }
    Config.fixConfig = fixConfig;
    function updateObjective() {
        const objective = world.scoreboard.getObjective(config.objective);
        if (!objective) {
            world.scoreboard.addObjective(config.objective);
            return;
        }
        for (const player of world.getPlayers()) {
            if (!player.scoreboardIdentity)
                objective.addScore(player, 0);
        }
    }
    Config.updateObjective = updateObjective;
    function setArray(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }
        const lastKey = keys[keys.length - 1];
        current[lastKey] = value;
        world.sendMessage(`${value}`);
    }
    function getArray(obj, path) {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current[key] === undefined || current[key] === null) {
                return undefined;
            }
            current = current[key];
        }
        return current;
    }
})(Config || (Config = {}));
world.afterEvents.worldInitialize.subscribe(() => {
    system.run(() => {
        Config.updateConfig();
    });
});
system.runInterval(() => {
    Config.fixConfig();
}, 2);
system.runInterval(() => {
    system.run(() => {
        Config.updateObjective();
    });
});
