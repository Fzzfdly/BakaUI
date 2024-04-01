import { system, world } from "@minecraft/server";
import EventEmitter from "./events";
import { PlayerClans } from "./clans";
import { config } from "./config";
import { PlayerName } from "./player";
import { PlayerRank, RankPerms } from "./rankperms";
export var CommandPermissionLevel;
(function (CommandPermissionLevel) {
    CommandPermissionLevel[CommandPermissionLevel["NORMAL"] = 0] = "NORMAL";
    CommandPermissionLevel[CommandPermissionLevel["ADMIN"] = 1] = "ADMIN";
})(CommandPermissionLevel || (CommandPermissionLevel = {}));
const cmdEvent = new EventEmitter();
const commands = new Map();
const commandsParams = new Map();
export const command = {
    prefix() {
        const raw = config.command_prefix;
        if (raw === undefined || raw === "")
            return "!";
        return raw;
    },
    find(command) {
        var _a;
        return (_a = commands.get(command)) !== null && _a !== void 0 ? _a : null;
    },
    register(name, description, permission = CommandPermissionLevel.NORMAL, callback, parameters) {
        const _command = CustomCommandFactory.createCommand({ name: name, description: description, permission: permission });
        cmdEvent.on(`command:${_command.name}`, (data) => {
            if (!data) {
                commandsParams.set(_command.name, parameters);
                return;
            }
            const player = data.player;
            let params = {};
            for (const [param, type] of Object.entries(parameters)) {
                let value = data.params[Object.keys(params).length];
                if (typeof value !== "undefined") {
                    if (type === "number") {
                        let number = Number(value);
                        if (number !== number) {
                            player.sendMessage(`§cError! Command: ${command.prefix() + _command.name + " " + Object.values(params).map((v) => {
                                if (typeof v === "object")
                                    return v.name;
                                else
                                    return v;
                            }).join(" ")} >>${value}§r§c<< Invalid command parameter`);
                            return;
                        }
                        else {
                            params[param] = Number(value);
                        }
                    }
                    else {
                        if (type === "player") {
                            const target = world.getDimension("overworld").getPlayers().find((v) => v.name.toLowerCase() === value.toLowerCase());
                            if (!target) {
                                player.sendMessage(["§c", { translate: "commands.generic.noTargetMatch" }]);
                                return;
                            }
                            params[param] = target;
                        }
                        else if (type === "playerid") {
                            const targetid = PlayerName.getPlayerId(value);
                            if (!targetid) {
                                player.sendMessage(["§c", { translate: "commands.generic.noTargetMatch" }]);
                                return;
                            }
                            params[param] = targetid;
                        }
                        else
                            params[param] = value;
                    }
                }
                else {
                    if (Object.values(params).length <= 1)
                        player.sendMessage(`§cError! Command: ${command.prefix() + _command.name + " " + Object.values(params).map((v) => {
                            if (typeof v === "object")
                                return v.name;
                            else
                                return v;
                        }).join(" ")} >>§r§c<< Invalid command parameter`);
                    else
                        player.sendMessage(`§cError! Command: ${command.prefix() + _command.name + Object.values(params).map((v) => {
                            if (typeof v === "object")
                                return v.name;
                            else
                                return v;
                        }).join(" ")} >>§r§c<< Invalid command parameter`);
                    return;
                }
            }
            if (Object.keys(parameters).length < Object.keys(data.params).length) {
                const err = Object.entries(data.params)[Object.keys(parameters).length];
                player.sendMessage(`§cError! Command: ${command.prefix() + _command.name + " " + Object.values(params).map((v) => {
                    if (typeof v === "object")
                        return v.name;
                    else
                        return v;
                }).join(" ")} >>${err[1]}§r§c<< Invalid command parameter`);
                return this;
            }
            system.run(() => {
                callback(params, player);
            });
        });
    }
};
export var CustomCommandFactory;
(function (CustomCommandFactory) {
    function getPlayerCommandPermission(player) {
        update();
        if (PlayerRank.isAdmin(player))
            return CommandPermissionLevel.ADMIN;
        else
            return CommandPermissionLevel.NORMAL;
    }
    CustomCommandFactory.getPlayerCommandPermission = getPlayerCommandPermission;
    function hasPermission(player, permission) {
        if (permission === CommandPermissionLevel.NORMAL)
            return true;
        if (PlayerRank.isAdmin(player))
            return true;
        if (typeof permission === "string" && PlayerRank.hasPermission(player, permission))
            return true;
        return false;
    }
    CustomCommandFactory.hasPermission = hasPermission;
    function createCommand(data) {
        const cmdRegex = /^[a-z]+$/;
        const permRegex = /^[a-z._]+$/;
        if (!cmdRegex.test(data.name))
            throw Error(`Command: "${command}" Invalid command name!`);
        if (typeof data.permission === "string" && !permRegex.test(data.permission))
            throw Error(`Command<${command}>: "${data.permission}" Invalid Permission!`);
        if (commands.has(data.name))
            throw Error(`Command: "${command}" Already registered!`);
        commands.set(data.name, data);
        return data;
    }
    CustomCommandFactory.createCommand = createCommand;
    function getCommandParameters(command) {
        var _a;
        update();
        return (_a = commandsParams.get(command)) !== null && _a !== void 0 ? _a : {};
    }
    CustomCommandFactory.getCommandParameters = getCommandParameters;
    function getHelpCommands(player) {
        let result = [];
        for (const data of commands.values()) {
            if (hasPermission(player, data.permission))
                result.push([data, Object.entries(getCommandParameters(data.name))]);
        }
        return result;
    }
    CustomCommandFactory.getHelpCommands = getHelpCommands;
    function emitCommand(player, text) {
        var _a;
        if (!text.startsWith(command.prefix()))
            return;
        text = text.substring(command.prefix().length);
        // const regex = /("[^"]*"|{[^}]*}|\b\w+\b)/g;
        const regex = /("[^"]*"|{[^}]*}|\b\d+(\.\d+)?\b|\b\w+\b)/g;
        let result = (_a = text.match(regex)) === null || _a === void 0 ? void 0 : _a.map(match => match.replace(/"/g, ''));
        if (!result) {
            player.sendMessage(["§c", { translate: "commands.generic.unknown", with: [command.prefix()] }]);
            return;
        }
        const cmd = result[0];
        const data = commands.get(cmd);
        if (!data || !hasPermission(player, data.permission)) {
            player.sendMessage(["§c", { translate: "commands.generic.unknown", with: [command.prefix() + cmd] }]);
            return;
        }
        let emitData = {
            player: player,
            params: result.slice(1),
        };
        cmdEvent.emit(`command:${cmd}`, emitData);
    }
    CustomCommandFactory.emitCommand = emitCommand;
    function update() {
        for (const cmd of commands.keys()) {
            cmdEvent.emit(`command:${cmd}`);
        }
    }
    CustomCommandFactory.update = update;
})(CustomCommandFactory || (CustomCommandFactory = {}));
world.beforeEvents.chatSend.subscribe((ev) => {
    ev.cancel = true;
    let msg = ev.message;
    const player = ev.sender;
    if (msg.startsWith(command.prefix())) {
        CustomCommandFactory.emitCommand(player, msg);
        return;
    }
    if (player.hasTag("mute")) {
        player.sendMessage(`§cYou are muted!`);
        return;
    }
    if (msg.startsWith(".clan")) {
        msg = msg.substring(".clan".length);
        PlayerClans.clanPlayerSendMessage(player, msg);
        return;
    }
    const rank = new RankPerms(PlayerRank.getRank(player));
    const clan = PlayerClans.getPlayerChat(player);
    const chat = clan + rank.getPlayerChat(player.name, msg);
    world.sendMessage(chat);
    console.log(textFilter(chat));
});
function textFilter(text) {
    return text.split("§").map((v, i) => { if (i === 0)
        return v;
    else
        return v.slice(1); }).join().replace(/,/g, "");
}
