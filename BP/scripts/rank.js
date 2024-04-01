import { system, world } from "@minecraft/server";
import { Config, config } from "./config";
import { PlayerClans } from "./clans";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
export var PlayerRankUI;
(function (PlayerRankUI) {
    function admin(player) {
        const form = new ActionFormData();
        form.title(`§aRank§dAdmin`);
        form.button(`§2Players§r\n§dManage Player Ranks`);
        form.button(`§2Set Name§r\n${config.rank.name}`);
        form.button(`§2Set Chat§r\n${config.rank.chat}`);
        form.button(`§2Set Rank Name§r\n${config.rank.rank_name}`);
        form.button(`§2Set Rank Chat§r\n${config.rank.rank_chat}`);
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === 0)
                rankPlayers(player);
            if (res.selection === 1)
                Config.setConfigUI(player, "rank.name");
            if (res.selection === 2)
                Config.setConfigUI(player, "rank.chat");
            if (res.selection === 3)
                Config.setConfigUI(player, "rank.rank_name");
            if (res.selection === 4)
                Config.setConfigUI(player, "rank.rank_chat");
        });
    }
    PlayerRankUI.admin = admin;
    function rankPlayers(player) {
        const form = new ActionFormData();
        form.title(`§aPlayer§dRanks`);
        form.body(`Click Player to Add/Remove/Manage Player Ranks`);
        const players = world.getAllPlayers();
        players.forEach((v) => form.button(`§d${v.name}`));
        form.button(`§8[ §cBACK §8]`);
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === players.length) {
                admin(player);
                return;
            }
            playerRanks(player, players[res.selection]);
        });
    }
    PlayerRankUI.rankPlayers = rankPlayers;
    function playerRanks(player, target) {
        const form = new ActionFormData();
        form.title(`§aPlayer§dRanks`);
        const ranks = PlayerRank.getPlayerRanks(target);
        ranks.forEach((v) => form.button(`${v}§r\n§cClick to Delete`));
        form.button(`§2Add Rank`);
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === ranks.length) {
                addPlayerRank(player, target);
                return;
            }
            else if (PlayerRank.removePlayerRank(player, ranks[res.selection])) {
                player.sendMessage(`[Rank] §aSuccess`);
            }
            else
                player.sendMessage(`[Rank] §cFailed`);
            playerRanks(player, target);
        });
    }
    PlayerRankUI.playerRanks = playerRanks;
    function addPlayerRank(player, target) {
        const form = new ModalFormData();
        form.title(`§aAdd§dRank`);
        form.textField(`Rank`, `Admin`);
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (res.formValues[0] === "" || res.formValues[0] === " ".repeat(res.formValues[0].length)) {
                player.sendMessage(`[Rank] §cFailed`);
                return;
            }
            if (PlayerRank.addPlayerRank(target, res.formValues[0].toString())) {
                player.sendMessage(`[Rank] §aSuccess`);
            }
            else
                player.sendMessage(`[Rank] §cFailed`);
        });
    }
    PlayerRankUI.addPlayerRank = addPlayerRank;
})(PlayerRankUI || (PlayerRankUI = {}));
export var PlayerRank;
(function (PlayerRank) {
    function addPlayerRank(player, rank) {
        rank = rank.replace("&", "§");
        if (player.hasTag(`rank:${rank}`))
            return false;
        return player.addTag(`rank:${rank}`);
    }
    PlayerRank.addPlayerRank = addPlayerRank;
    function removePlayerRank(player, rank) {
        return player.removeTag(`rank:${rank}`);
    }
    PlayerRank.removePlayerRank = removePlayerRank;
    function getPlayerRanks(player) {
        let ranks = player.getTags().filter((v) => (v.startsWith(config.rank.prefix) && v.length > config.rank.prefix.length)).map((v) => v.substring(config.rank.prefix.length));
        if (ranks.length === 0)
            ranks.push(config.rank.default_rank);
        return ranks;
    }
    PlayerRank.getPlayerRanks = getPlayerRanks;
    function getPlayerName(player) {
        const configRankName = config.rank.rank_name;
        const ranks = getPlayerRanks(player).map((v) => configRankName.replace(/{rank}/g, v)).join("");
        const configName = config.rank.name;
        const playerName = configName.replace(/{ranks}/g, ranks).replace(/{player}/g, player.name);
        return playerName;
    }
    PlayerRank.getPlayerName = getPlayerName;
    function getPlayerChat(player, message) {
        const configRankChat = config.rank.rank_chat;
        const ranks = getPlayerRanks(player).map((v) => configRankChat.replace(/{rank}/g, v)).join("");
        const configChat = config.rank.chat;
        const playerChat = configChat.replace(/{ranks}/g, ranks).replace(/{player}/g, player.name).replace(/{chat}/g, message);
        return playerChat;
    }
    PlayerRank.getPlayerChat = getPlayerChat;
    function update() {
        for (const player of world.getAllPlayers()) {
            let nameTag = PlayerRank.getPlayerName(player);
            const clan = PlayerClans.getPlayerName(player);
            if (clan !== "")
                nameTag = nameTag + "\n" + clan;
            player.nameTag = nameTag;
        }
    }
    PlayerRank.update = update;
})(PlayerRank || (PlayerRank = {}));
system.runInterval(() => {
    system.run(() => {
        PlayerRank.update();
    });
});
