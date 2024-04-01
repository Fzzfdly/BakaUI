import { system, world } from "@minecraft/server";
import { Database } from "./utils/database";
import { Config, config } from "./config";
import { PlayerClans } from "./clans";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PlayerName } from "./player";
export var RankUI;
(function (RankUI) {
    function admin(player) {
        const form = new ActionFormData();
        form.title(`§aRank§dUI`);
        form.body(`Ranks List:`);
        let ranks = [[config.rank.default_rank.name, config.rank.default_rank.rank]];
        ranks.push(...Object.entries(RankPerms.getRanks()));
        ranks.forEach(([rank, data]) => form.button(`${data.display}§r\n§8Rank: §a${rank}`));
        form.button(`§aPlayers`);
        form.button(`§aCreate Rank`);
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === ranks.length) {
                playersRank(player);
                return;
            }
            if (res.selection === ranks.length + 1) {
                createRank(player);
                return;
            }
            adminRank(player, ranks[res.selection][0]);
        });
    }
    RankUI.admin = admin;
    function createRank(player) {
        const form = new ModalFormData();
        form.title(`§aCreate§dRank`);
        form.textField(`Rank:`, `VIP`);
        form.textField(`Display (optional):`, `VIP+`);
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            RankPerms.createRank(`${res.formValues[0]}`, (res.formValues[1] !== "" ? `${res.formValues[1]}` : undefined), player);
        });
    }
    RankUI.createRank = createRank;
    function playersRank(player) {
        const form = new ActionFormData();
        form.title(`§aPlayersRank`);
        const players = Object.entries(PlayerName.getPlayers());
        players.forEach((v) => form.button(`§d${v[1]}§r\n§8Rank: §a${PlayerRank.getRankById(v[0])}`));
        form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === players.length) {
                admin(player);
                return;
            }
            setPlayerRank(player, players[res.selection][0]);
        });
    }
    RankUI.playersRank = playersRank;
    function setPlayerRank(player, playerId) {
        const form = new ModalFormData();
        form.title(`§8Rank: §r${PlayerName.getName(playerId)}`);
        let ranks = [[config.rank.default_rank.name, config.rank.default_rank.rank]];
        ranks.push(...Object.entries(RankPerms.getRanks()));
        form.dropdown(`/tag <target> add setrank:${config.rank.default_rank.name} §a- Set Player Rank§r\n\nRank:`, ranks.map((v) => v[1].display), (ranks.findIndex((v) => v[0] === PlayerRank.getRankById(playerId)) >= 0 ? ranks.findIndex((v) => v[0] === PlayerRank.getRankById(playerId)) : 0));
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            PlayerRank.setRankById(playerId, ranks[Number(res.formValues[0])][0], player);
        });
    }
    RankUI.setPlayerRank = setPlayerRank;
    function adminRank(player, rank) {
        const rankPerms = RankPerms.getRank(rank);
        if (!rankPerms)
            return;
        const form = new ActionFormData();
        let isDefault = false;
        form.title(`§8Rank: §a${rank}`);
        form.button(`§2Set Rank Name§r\n§e${rank}`);
        form.button(`§2Permissions§r\n§eManage Permissions`);
        form.button(`§2Display§r\n${rankPerms.getDisplay()}`);
        form.button(`§2Player Chat§r\n${rankPerms.getChat()}`);
        form.button(`§2Player Name§r\n${rankPerms.getName()}`);
        if (rank.toLowerCase() === config.rank.default_rank.name.toLowerCase()) {
            form.button(`§cDelete§r\n§eDelete Rank`);
            isDefault = true;
        }
        form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === 0)
                setRankName(player, rankPerms);
            if (res.selection === 1)
                rankPermissions(player, rankPerms);
            if (res.selection === 2)
                setRankDisplay(player, rankPerms);
            if (res.selection === 3)
                setPlayerChat(player, rankPerms);
            if (res.selection === 4)
                setPlayerName(player, rankPerms);
            if (isDefault) {
                if (res.selection === 5)
                    RankPerms.deleteRank(rank, player);
                if (res.selection === 6)
                    admin(player);
            }
            if (!isDefault && res.selection === 5)
                admin(player);
        });
    }
    RankUI.adminRank = adminRank;
    function rankPermissions(player, rank) {
        const form = new ActionFormData();
        form.title(`§8Permissions: §a${rank.getRank()}`);
        form.body(`Rank:\n  §aexample.admin§r\nTag:\n  §aperm:example.admin`);
        const perms = rank.getPermissions();
        perms.forEach((v) => form.button(`§d${v}§r\n§cClick to Remove`));
        form.button(`§aAdd Permission`);
        form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === perms.length) {
                addPermission(player, rank);
                return;
            }
            if (res.selection === perms.length + 1) {
                adminRank(player, rank.getRank());
                return;
            }
            rank.removePermission(perms[res.selection], player);
        });
    }
    RankUI.rankPermissions = rankPermissions;
    function addPermission(player, rank) {
        const form = new ModalFormData();
        form.title(`§8AddPermission: §a${rank.getRank()}`);
        form.textField(`Permission:`, `admin`);
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (typeof res.formValues[0] === "string")
                rank.addPermission(res.formValues[0], player);
        });
    }
    RankUI.addPermission = addPermission;
    function setRankName(player, rank) {
        const form = new ModalFormData();
        form.title(`§8SetRankName: §a${rank.getRank()}`);
        form.textField(`Rank:`, rank.getRank(), rank.getRank());
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (typeof res.formValues[0] === "string")
                rank.setRank(res.formValues[0], player);
        });
    }
    RankUI.setRankName = setRankName;
    function setRankDisplay(player, rank) {
        const form = new ModalFormData();
        form.title(`§8SetRankDisplay: §a${rank.getRank()}`);
        form.textField(`Display:`, rank.getDisplay(), rank.getDisplay());
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (typeof res.formValues[0] === "string")
                rank.setDisplay(res.formValues[0], player);
        });
    }
    RankUI.setRankDisplay = setRankDisplay;
    function setPlayerChat(player, rank) {
        const form = new ModalFormData();
        form.title(`§8SetPlayerChat: §a${rank.getRank()}`);
        form.textField(`Chat:`, rank.getChat(), rank.getChat());
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (typeof res.formValues[0] === "string")
                rank.setChat(res.formValues[0], player);
        });
    }
    RankUI.setPlayerChat = setPlayerChat;
    function setPlayerName(player, rank) {
        const form = new ModalFormData();
        form.title(`§8SetPlayerName: §a${rank.getRank()}`);
        form.textField(`Name:`, rank.getName(), rank.getName());
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (typeof res.formValues[0] === "string")
                rank.setName(res.formValues[0], player);
        });
    }
    RankUI.setPlayerName = setPlayerName;
})(RankUI || (RankUI = {}));
export class RankPerms {
    static createRank(rank, display = rank, author) {
        let ranks = RankPerms.getRanks();
        const regex = /^[a-zA-Z0-9]+$/;
        if (rank === "" || !regex.test(rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid Rank!`);
            return null;
        }
        if (ranks.hasOwnProperty(rank) || rank.toLowerCase() === config.rank.default_rank.name.toLowerCase()) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank Already!`);
            return null;
        }
        if (display === "" || display === " ".repeat(display.length)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid display!`);
            return null;
        }
        ranks[rank] = {
            chat: config.rank.default_rank.rank.chat,
            name: config.rank.default_rank.rank.name,
            display: display,
            permissions: [],
        };
        Database.set("candra:rank", ranks);
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess create rank`);
        PlayerRank.updatePlayersRank();
        PlayerRank.updatePlayers();
        return RankPerms.getRank(rank);
    }
    static deleteRank(rank, author) {
        let ranks = RankPerms.getRanks();
        if (!ranks.hasOwnProperty(rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank not found!`);
            return false;
        }
        delete ranks[rank];
        Database.set("candra:rank", ranks);
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess delete rank`);
        PlayerRank.updatePlayersRank();
        PlayerRank.updatePlayers();
        return true;
    }
    static getRanks() {
        const data = Database.get("candra:rank");
        if (typeof data !== "object")
            return {};
        else
            return data;
    }
    static getRank(rank) {
        if (rank.toLowerCase() === config.rank.default_rank.name.toLowerCase())
            return new RankPerms(rank);
        if (!this.getRanks().hasOwnProperty(rank))
            return null;
        return new RankPerms(rank);
    }
    static getDisplay(rank) {
        var _a, _b;
        if (rank.toLowerCase() === config.rank.default_rank.name.toLowerCase())
            return config.rank.default_rank.rank.display;
        return (_b = (_a = this.getRank(rank)) === null || _a === void 0 ? void 0 : _a.getDisplay()) !== null && _b !== void 0 ? _b : rank;
    }
    static getPermissions(rank) {
        var _a, _b;
        if (rank.toLowerCase() === config.rank.default_rank.name.toLowerCase())
            return config.rank.default_rank.rank.permissions;
        return (_b = (_a = this.getRank(rank)) === null || _a === void 0 ? void 0 : _a.getPermissions()) !== null && _b !== void 0 ? _b : [];
    }
    static hasPermission(rank, perm) {
        var _a, _b;
        if (rank.toLowerCase() === config.rank.default_rank.name.toLowerCase())
            return config.rank.default_rank.rank.permissions.includes(perm);
        return (_b = (_a = this.getRank(rank)) === null || _a === void 0 ? void 0 : _a.hasPermission(perm)) !== null && _b !== void 0 ? _b : false;
    }
    constructor(rank) {
        this.rank = rank;
    }
    setRank(rank, author) {
        const regex = /^[a-zA-Z0-9]+$/;
        let ranks = RankPerms.getRanks();
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase()) {
            if (!regex.test(rank)) {
                author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid Rank!`);
                return false;
            }
            if (ranks.hasOwnProperty(rank) || rank.toLowerCase() === config.rank.default_rank.name.toLowerCase()) {
                author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank Already!`);
                return false;
            }
            Config.setConfig("rank.default_rank.name", rank);
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess set rank`);
            return true;
        }
        if (!ranks.hasOwnProperty(this.rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank not found!`);
            return false;
        }
        if (!regex.test(rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid Rank!`);
            return false;
        }
        if (ranks.hasOwnProperty(rank) || rank.toLowerCase() === config.rank.default_rank.name.toLowerCase()) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank Already!`);
            return false;
        }
        const entries = Object.entries(ranks);
        const newEntries = entries.map(([key, value]) => {
            if (key === this.rank)
                return [rank, value];
            return [key, value];
        });
        const newRecord = Object.fromEntries(newEntries);
        ranks = newRecord;
        Database.set("candra:rank", ranks);
        Object.keys(PlayerName.getPlayers()).forEach((playerId) => {
            world.sendMessage(PlayerRank.getRankById(playerId));
            if (PlayerRank.getRankById(playerId) === this.rank)
                PlayerRank.setRankById(playerId, rank);
        });
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess set rank`);
        PlayerRank.updatePlayersRank();
        PlayerRank.updatePlayers();
        return true;
    }
    setDisplay(display, author) {
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase()) {
            if (display === "" || display === " ".repeat(display.length)) {
                author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid display!`);
                return false;
            }
            Config.setConfig("rank.default_rank.rank.display", display);
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess set display`);
            return true;
        }
        let ranks = RankPerms.getRanks();
        if (!ranks.hasOwnProperty(this.rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank not found!`);
            return false;
        }
        if (display === "" || display === " ".repeat(display.length)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid display!`);
            return false;
        }
        ranks[this.rank].display = display;
        Database.set("candra:rank", ranks);
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess set display`);
        PlayerRank.updatePlayersRank();
        PlayerRank.updatePlayers();
        return true;
    }
    addPermission(perm, author) {
        const regex = /^[a-z._]+$/;
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase()) {
            if (perm === "" || !regex.test(perm)) {
                author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid Permission!`);
                return false;
            }
            let perms = config.rank.default_rank.rank.permissions;
            if (perms.includes(perm)) {
                author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cPermission Already!`);
                return false;
            }
            perms.push(perm);
            Config.setConfig("rank.default_rank.rank.permissions", perms);
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess add permission`);
            return true;
        }
        let ranks = RankPerms.getRanks();
        if (!ranks.hasOwnProperty(this.rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank not found!`);
            return false;
        }
        if (perm === "" || !regex.test(perm)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid Permission!`);
            return false;
        }
        let perms = ranks[this.rank].permissions;
        if (perms.includes(perm)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cPermission Already!`);
            return false;
        }
        perms.push(perm);
        ranks[this.rank].permissions = perms;
        Database.set("candra:rank", ranks);
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess add permission`);
        PlayerRank.updatePlayersRank();
        PlayerRank.updatePlayers();
        return true;
    }
    removePermission(perm, author) {
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase()) {
            let perms = config.rank.default_rank.rank.permissions;
            if (!perms.includes(perm)) {
                author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cPermission not found!`);
                return false;
            }
            Config.setConfig("rank.default_rank.rank.permissions", perms.filter((v) => v !== perm));
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess remove permission`);
            return true;
        }
        let ranks = RankPerms.getRanks();
        if (!ranks.hasOwnProperty(this.rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank not found!`);
            return false;
        }
        let perms = ranks[this.rank].permissions;
        if (!perms.includes(perm)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cPermission not found!`);
            return false;
        }
        ranks[this.rank].permissions = perms.filter((v) => v !== perm);
        Database.set("candra:rank", ranks);
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess remove permission`);
        PlayerRank.updatePlayersRank();
        PlayerRank.updatePlayers();
        return true;
    }
    setName(name, author) {
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase()) {
            if (name === "" || name === " ".repeat(name.length)) {
                author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid Name!`);
                return false;
            }
            Config.setConfig("rank.default_rank.rank.name", name);
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess set rank name`);
            return true;
        }
        let ranks = RankPerms.getRanks();
        if (!ranks.hasOwnProperty(this.rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank not found!`);
            return false;
        }
        if (name === "" || name === " ".repeat(name.length)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid Name!`);
            return false;
        }
        ranks[this.rank].name = name;
        Database.set("candra:rank", ranks);
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess set rank name`);
        PlayerRank.updatePlayersRank();
        PlayerRank.updatePlayers();
        return true;
    }
    setChat(chat, author) {
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase()) {
            if (chat === "" || chat === " ".repeat(chat.length)) {
                author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid Chat!`);
                return false;
            }
            Config.setConfig("rank.default_rank.rank.chat", chat);
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess set rank chat`);
            return true;
        }
        let ranks = RankPerms.getRanks();
        if (!ranks.hasOwnProperty(this.rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank not found!`);
            return false;
        }
        if (chat === "" || chat === " ".repeat(chat.length)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cInvalid Chat!`);
            return false;
        }
        ranks[this.rank].chat = chat;
        Database.set("candra:rank", ranks);
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess set rank chat`);
        PlayerRank.updatePlayersRank();
        PlayerRank.updatePlayers();
        return true;
    }
    getRank() {
        return this.rank;
    }
    getName() {
        var _a;
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase())
            return config.rank.default_rank.rank.name;
        let ranks = RankPerms.getRanks();
        return (_a = ranks[this.rank].name) !== null && _a !== void 0 ? _a : config.rank.default_rank.rank.name;
    }
    getChat() {
        var _a;
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase())
            return config.rank.default_rank.rank.chat;
        let ranks = RankPerms.getRanks();
        return (_a = ranks[this.rank].chat) !== null && _a !== void 0 ? _a : config.rank.default_rank.rank.chat;
    }
    getPlayerChat(playerName, chat) {
        if (!this.hasPermission("chat.filter"))
            chat = ChatFilter.filterChat(chat);
        return this.getChat().replace(/{player}/g, playerName).replace(/{rank}/g, this.getDisplay()).replace(/{chat}/g, chat);
    }
    getPlayerName(playerName) {
        return this.getName().replace(/{player}/g, playerName).replace(/{rank}/g, this.getDisplay());
    }
    getDisplay() {
        var _a;
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase())
            return config.rank.default_rank.rank.display;
        let ranks = RankPerms.getRanks();
        return (_a = ranks[this.rank].display) !== null && _a !== void 0 ? _a : this.rank;
    }
    getPermissions() {
        var _a;
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase())
            return config.rank.default_rank.rank.permissions;
        let ranks = RankPerms.getRanks();
        return (_a = ranks[this.rank].permissions) !== null && _a !== void 0 ? _a : [];
    }
    hasPermission(perm) {
        if (this.rank.toLowerCase() === config.rank.default_rank.name.toLowerCase())
            return config.rank.default_rank.rank.permissions.includes(perm);
        let ranks = RankPerms.getRanks();
        return (ranks[this.rank] ? ranks[this.rank].permissions.includes(perm) : false);
    }
}
export var PlayerRank;
(function (PlayerRank) {
    function setRank(player, rank, author) {
        let playersRank = Database.get("candra:playerrank");
        if (typeof playersRank === "undefined")
            playersRank = {};
        if (!RankPerms.getRank(rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank not found!`);
            return false;
        }
        playersRank[player.id] = rank;
        Database.set("candra:playerrank", playersRank);
        updatePlayersRank();
        updatePlayers();
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess set player rank`);
        return true;
    }
    PlayerRank.setRank = setRank;
    function setRankById(playerId, rank, author) {
        let playersRank = Database.get("candra:playerrank");
        if (typeof playersRank === "undefined")
            playersRank = {};
        if (!RankPerms.getRank(rank)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §cRank not found!`);
            return false;
        }
        playersRank[playerId] = rank;
        Database.set("candra:playerrank", playersRank);
        updatePlayersRank();
        updatePlayers();
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Rank] §aSuccess set player rank`);
        return true;
    }
    PlayerRank.setRankById = setRankById;
    function getRank(player) {
        let res = config.rank.default_rank.name;
        const data = Database.get("candra:playerrank");
        if (typeof data === "undefined")
            return res;
        const idRank = Object.entries(data).find((v) => v[0] === player.id);
        if (!idRank)
            return res;
        if (RankPerms.getRank(idRank[1]))
            res = idRank[1];
        return res;
    }
    PlayerRank.getRank = getRank;
    function getRankById(playerId) {
        let res = config.rank.default_rank.name;
        const data = Database.get("candra:playerrank");
        if (typeof data === "undefined")
            return res;
        const idRank = Object.entries(data).find((v) => v[0] === playerId);
        if (!idRank)
            return res;
        if (RankPerms.getRank(idRank[1]))
            res = idRank[1];
        return res;
    }
    PlayerRank.getRankById = getRankById;
    function isAdmin(player) {
        if (player.hasTag("perm:admin"))
            return true;
        if (player.isOp())
            return true;
        const rank = RankPerms.getRank(getRank(player));
        if (!rank)
            return false;
        return rank.hasPermission("admin");
    }
    PlayerRank.isAdmin = isAdmin;
    function hasPermission(player, perm) {
        if (isAdmin(player))
            return true;
        const rank = RankPerms.getRank(getRank(player));
        if (!rank)
            return false;
        return rank.hasPermission(perm);
    }
    PlayerRank.hasPermission = hasPermission;
    function getPermissions(player) {
        const rankName = getRank(player);
        if (!rankName)
            return [];
        return RankPerms.getPermissions(rankName);
    }
    PlayerRank.getPermissions = getPermissions;
    function updatePlayersRank() {
        let ranks = Database.get("candra:playerrank");
        if (typeof ranks === "undefined")
            ranks = {};
        for (const [id, rank] of Object.entries(ranks)) {
            if (!Object.keys(RankPerms.getRanks()).includes(rank))
                delete ranks[id];
        }
        Database.set("candra:playerrank", ranks);
        for (const player of world.getPlayers()) {
            const rank = PlayerRank.getRank(player);
            const tags = player.getTags().filter((v) => (v.startsWith("rank:") && v !== "rank:" + rank));
            if (tags.length > 0)
                tags.forEach((v) => player.removeTag(v));
            if (rank !== config.rank.default_rank.name && !player.hasTag("rank:" + rank))
                player.addTag("rank:" + rank);
        }
    }
    PlayerRank.updatePlayersRank = updatePlayersRank;
    function updatePlayerPermissions(player) {
        const playerRank = RankPerms.getRank(getRank(player));
        if (!playerRank)
            return;
        playerRank.getPermissions().forEach((perm) => {
            if (!player.hasTag("perm:" + perm))
                player.addTag("perm:" + perm);
        });
        for (const perm of player.getTags().filter((v) => v.startsWith("perm:") && v !== "perm:admin").map((v) => v.substring("perm:".length))) {
            if (!playerRank.hasPermission(perm))
                player.removeTag("perm:" + perm);
        }
    }
    PlayerRank.updatePlayerPermissions = updatePlayerPermissions;
    function updatePlayerName(player) {
        const rankName = getRank(player);
        if (!rankName)
            return;
        const playerRank = RankPerms.getRank(rankName);
        if (!playerRank)
            return;
        for (const player of world.getAllPlayers()) {
            let nameTag = playerRank.getPlayerName(player.name);
            const clan = PlayerClans.getPlayerName(player);
            if (clan !== "")
                nameTag = nameTag + "\n" + clan;
            player.nameTag = nameTag;
        }
    }
    PlayerRank.updatePlayerName = updatePlayerName;
    function updatePlayers() {
        const players = world.getAllPlayers();
        for (const player of players) {
            updatePlayerName(player);
            updatePlayerPermissions(player);
        }
    }
    PlayerRank.updatePlayers = updatePlayers;
})(PlayerRank || (PlayerRank = {}));
export var ChatFilter;
(function (ChatFilter) {
    function getRawFilters() {
        const data = Database.get("candra:chatfilter");
        if (typeof data !== "object")
            return [];
        else
            return data;
    }
    ChatFilter.getRawFilters = getRawFilters;
    function getFilters() {
        return getRawFilters().map((v) => {
            let txts = v.split("=");
            if (txts.length === 1 && txts[0].length > 0)
                return txts[0];
            if (txts.length > 1 && txts[0].length === 0)
                return v;
            if (txts.length > 1 && txts[0].length > 0) {
                const txt0 = txts[0];
                txts.shift();
                const txt1 = txts.join("=");
                if (txt1 === "")
                    return txt0;
                if (txt1 === "*")
                    return [txt0, "*".repeat(txt0.length)];
                return [txt0, txt1];
            }
            ;
        });
    }
    ChatFilter.getFilters = getFilters;
    function filterChat(chat) {
        getFilters().forEach((txt) => {
            if (typeof txt === "string") {
                const key = new RegExp(txt, "g");
                chat.replace(key, "");
            }
            else {
                const key = new RegExp(txt[0], "g");
                chat.replace(key, txt[1]);
            }
        });
        return chat;
    }
    ChatFilter.filterChat = filterChat;
    function addFilter(txt, author) {
        let data = getRawFilters();
        if (txt === "") {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[ChatFilter] §cInvalid Filter!`);
            return false;
        }
        if (data.includes(txt)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[ChatFilter] §cFilter Already!`);
            return false;
        }
        data.push(txt);
        Database.set("candra:chatfilter", data);
        author === null || author === void 0 ? void 0 : author.sendMessage(`[ChatFilter] §aSuccess add filter`);
        return true;
    }
    ChatFilter.addFilter = addFilter;
    function removeFilter(txt, author) {
        let data = getRawFilters();
        if (!data.includes(txt)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[ChatFilter] §cFilter not found!`);
            return false;
        }
        data = data.filter((v) => v !== txt);
        Database.set("candra:chatfilter", data);
        author === null || author === void 0 ? void 0 : author.sendMessage(`[ChatFilter] §aSuccess remove filter`);
        return true;
    }
    ChatFilter.removeFilter = removeFilter;
})(ChatFilter || (ChatFilter = {}));
export var ChatFilterUI;
(function (ChatFilterUI) {
    function main(player) {
        const form = new ActionFormData();
        form.title(`§aChat§dFilter`);
        form.body(`Click to remove filter:`);
        const filters = ChatFilter.getRawFilters();
        filters.forEach((v) => form.button(`§a${v}§r\n§cClick to Remove`));
        form.button(`§aAdd Filter`);
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === filters.length) {
                const form2 = new ModalFormData();
                form2.title(`§aAdd§dFilter`);
                form2.textField(`Filter:`, `Hi=Hello`);
                form2.show(player).then((res2) => {
                    if (res2.canceled || res2.formValues === undefined)
                        return;
                    ChatFilter.addFilter(`${res2.formValues[0]}`, player);
                });
                return;
            }
            ChatFilter.removeFilter(filters[res.selection], player);
        });
    }
    ChatFilterUI.main = main;
})(ChatFilterUI || (ChatFilterUI = {}));
system.runInterval(() => {
    system.run(() => {
        PlayerRank.updatePlayersRank();
        PlayerRank.updatePlayers();
    });
    system.run(() => {
        const players = world.getPlayers().filter((v) => v.getTags().find((vv) => vv.startsWith("setrank:")));
        players.forEach((player) => {
            const rank = player.getTags().find((v) => v.startsWith("setrank:")).substring("setrank:".length);
            PlayerRank.setRank(player, rank);
            player.removeTag("setrank:" + rank);
        });
    });
});
