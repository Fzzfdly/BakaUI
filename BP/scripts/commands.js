import { world } from "@minecraft/server";
import { CommandPermissionLevel, CustomCommandFactory, command } from "./command";
import { config } from "./config";
import { PlayerName } from "./player";
import { ScoreCounts } from "./utils/counts";
import { Pay } from "./pay";
import { Warp } from "./warp";
import { TPA } from "./tpa";
import { Home } from "./home";
// Help
command.register("help", "Provides help/list of commands.", undefined, (p, player) => {
    const cmds = paginateArray(CustomCommandFactory.getHelpCommands(player).map(([cmd, params]) => `§r§e- §a${command.prefix()}${cmd.name} ${params.map((v) => `<${v[0]}: ${v[1]}>`).join(" ")} §b- ${cmd.description}`), 7);
    let texts = `§8---- §2Candra§dCommands §7page 1 of ${cmds.length} §8----§r\n${cmds[0].join("\n")}§r\n§2Use ${command.prefix()}pagehelp <page> for switch page or use ${command.prefix()}cmdhelp <command> for command details`;
    player.sendMessage(texts);
}, {});
command.register("pagehelp", "Provides help/list of commands.", undefined, (p, player) => {
    const cmds = paginateArray(CustomCommandFactory.getHelpCommands(player).map(([cmd, params]) => `§r§e- §a${command.prefix()}${cmd.name} ${params.map((v) => `<${v[0]}: ${v[1]}>`).join(" ")} §b- ${cmd.description}`), 7);
    if (p.page > cmds.length)
        p.page = cmds.length;
    if (p.page <= 0)
        p.page = 1;
    const page = p.page - 1;
    const cmd = cmds[page];
    let texts = `§8---- §2Candra§dCommands §7page ${page + 1} of ${cmds.length} §8----§r\n${cmd.join("\n")}§r\n§2Use ${command.prefix()}pagehelp <page> for switch page or use ${command.prefix()}cmdhelp <command> for command details`;
    player.sendMessage(texts);
}, {
    page: "number",
});
command.register("cmdhelp", "Provides help/details of command.", undefined, (p, player) => {
    const cmds = CustomCommandFactory.getHelpCommands(player);
    const cmd = cmds.find(([data, params]) => data.name === p.command);
    if (!cmd) {
        player.sendMessage(`§cCommand not found!`);
        return;
    }
    let texts = `§8---- §2Candra§dCommand §7${cmd[0].name} §8----§r\n§e-§r Command: §a${command.prefix()}${cmd[0].name} ${cmd[1].map((v) => `<${v[0]}: ${v[1]}>`).join(" ")}§r\n§e-§r Description: §b${cmd[0].description}§r\n§e-§r Permission: §e${typeof cmd[0].permission === "string" && cmd[0].permission || typeof cmd[0].permission === "number" && CommandPermissionLevel[cmd[0].permission]}§r\n§2Use ${command.prefix()}pagehelp <page> for switch page or use ${command.prefix()}cmdhelp <command> for command details`;
    player.sendMessage(texts);
}, {
    command: "string",
});
// Money
command.register("money", "Check player money", CommandPermissionLevel.NORMAL, (p, player) => {
    const playerId = PlayerName.getPlayerId(p.name);
    if (!playerId) {
        player.sendMessage(`§cPlayer not found!`);
        return;
    }
    const money = ScoreCounts.getPlayerMoney(playerId).toLocaleString("en-US");
    player.sendMessage(`§a${PlayerName.getName(playerId) === player.name ? "You" : PlayerName.getName(playerId)}: §e${config.currency}${money}`);
}, {
    name: "string"
});
command.register("mymoney", "Check your money", CommandPermissionLevel.NORMAL, (p, player) => {
    const money = ScoreCounts.getPlayerMoney(player.id).toLocaleString("en-US");
    player.sendMessage(`§aYou: §e${config.currency}${money}`);
}, {});
command.register("topmoney", "List top money players", CommandPermissionLevel.NORMAL, (p, player) => {
    const objective = world.scoreboard.getObjective(config.objective);
    if (!objective) {
        player.sendMessage(`§c${config.objective} not found!`);
        return;
    }
    const scores = objective.getScores().sort((a, b) => b.score - a.score);
    const index = scores.findIndex((v) => v.participant.id === ScoreCounts.getScoreId(player.id));
    let lastText = ``;
    if (index >= 0)
        lastText = `\n§2You are in place §b#` + (index + 1) + `: §e${config.currency}${scores[index].score.toLocaleString("en-US")}`;
    let text = `§2--- §eTop of ${objective.displayName} §r§2---§r\n${scores.splice(0, 10).map((v, i) => `§r§b#` + (i + 1) + ` §a` + PlayerName.getName(ScoreCounts.getPlayerId(v.participant.id)) + ` §e` + config.currency + v.score.toLocaleString("en-US")).join("\n")}§r${lastText}`;
    player.sendMessage(text);
}, {});
command.register("addmoney", "Add Money to Player", CommandPermissionLevel.ADMIN, (p, player) => {
    const objective = world.scoreboard.getObjective(config.objective);
    if (!objective)
        world.scoreboard.addObjective(config.objective);
    const amount = p.amount * 10 / 10;
    if (amount <= 0) {
        player.sendMessage(`§cInvalid amount`);
        return;
    }
    objective.addScore(player, amount);
    player.sendMessage(`§aSuccess to add §e${config.currency}${amount} ${objective.id}§a to §b${player.name}`);
}, {
    player: "player",
    amount: "number"
});
command.register("removemoney", "Remove Money to Player", CommandPermissionLevel.ADMIN, (p, player) => {
    var _a;
    const objective = world.scoreboard.getObjective(config.objective);
    if (!objective)
        world.scoreboard.addObjective(config.objective);
    const amount = p.amount * 10 / 10;
    if (amount <= 0) {
        player.sendMessage(`§cInvalid amount`);
        return;
    }
    const total = ((_a = objective.getScore(player)) !== null && _a !== void 0 ? _a : 0) - amount;
    objective.setScore(player, total);
    player.sendMessage(`§aSuccess to remove §e${config.currency}${amount} ${objective.id}§a to §b${player.name}`);
}, {
    player: "player",
    amount: "number"
});
command.register("setmoney", "Set Money to Player", CommandPermissionLevel.ADMIN, (p, player) => {
    const objective = world.scoreboard.getObjective(config.objective);
    if (!objective)
        world.scoreboard.addObjective(config.objective);
    const amount = p.amount * 10 / 10;
    if (amount <= 0) {
        player.sendMessage(`§cInvalid amount`);
        return;
    }
    objective.setScore(player, amount);
    player.sendMessage(`§aSuccess to set §e${config.currency}${amount} ${objective.id}§a to §b${player.name}`);
}, {
    player: "player",
    amount: "number"
});
// Pay
command.register("pay", "Transfer Money to Other Player", CommandPermissionLevel.NORMAL, (p, player) => {
    Pay.transfer(player, p.target, p.amount);
}, {
    target: "player",
    amount: "number"
});
// TPA
command.register("tpa", "Request teleport to Other Player", CommandPermissionLevel.NORMAL, (p, player) => {
    TPA.teleportRequest(player, p.target);
}, {
    target: "player"
});
command.register("tpcancel", "Cancel teleport", CommandPermissionLevel.NORMAL, (p, player) => {
    TPA.cancelRequestTeleport(player);
}, {});
command.register("tpaccept", "Accept teleport", CommandPermissionLevel.NORMAL, (p, player) => {
    TPA.acceptTeleportRequest(player);
}, {});
command.register("tpreject", "Reject teleport", CommandPermissionLevel.NORMAL, (p, player) => {
    TPA.rejectTeleportRequest(player);
}, {});
// Homes
command.register("home", "Teleport to your home", CommandPermissionLevel.NORMAL, (p, player) => {
    Home.teleport(player, p.home);
}, {
    home: "string"
});
command.register("homes", "List of homes", CommandPermissionLevel.NORMAL, (p, player) => {
    let text = `§aHomes: §r\n${Home.getHomes(player).map((v) => `§r§e - §b` + v.name).join("\n")}`;
    player.sendMessage(text);
}, {});
command.register("sethome", "Set/Create a new home", CommandPermissionLevel.NORMAL, (p, player) => {
    Home.setHome(player, p.home);
}, {
    home: "string"
});
command.register("delhome", "Delete home", CommandPermissionLevel.NORMAL, (p, player) => {
    Home.deleteHome(player, p.home);
}, {
    home: "string"
});
// Warps
command.register("warp", "Teleport to warp location", CommandPermissionLevel.NORMAL, (p, player) => {
    Warp.teleport(player, p.warp);
}, {
    warp: "string",
});
command.register("warps", "List of warps", CommandPermissionLevel.NORMAL, (p, player) => {
    let text = `§aWarps: §r\n${Warp.getWarps().map((v) => `§r§e - §b` + v.name).join("\n")}`;
    player.sendMessage(text);
}, {});
command.register("listwarp", "List of warps", CommandPermissionLevel.NORMAL, (p, player) => {
    let text = `§aWarps: §r\n${Warp.getWarps().map((v) => `§r§e - §b` + v.name).join("\n")}`;
    player.sendMessage(text);
}, {});
command.register("setwarp", "Set/Create warp", CommandPermissionLevel.ADMIN, (p, player) => {
    Warp.setWarp(p.warp, player.location, player.dimension.id, undefined, player);
}, {
    warp: "string"
});
command.register("delwarp", "Delete warp", CommandPermissionLevel.ADMIN, (p, player) => {
    Warp.deleteWarp(p.warp, player);
}, {
    warp: "string"
});
function paginateArray(arr, pageSize) {
    const pages = [];
    for (let i = 0; i < arr.length; i += pageSize) {
        const page = arr.slice(i, i + pageSize);
        pages.push(page);
    }
    return pages;
}
