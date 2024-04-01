import { system, world } from "@minecraft/server";
import { Config, config } from "./config";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { PlayerInventory } from "./container";
import { PlayerName } from "./player";
import { Database } from "./utils/database";
import { TPA } from "./tpa";
import { ScoreCounts } from "./utils/counts";
import { CenterPos } from "./pos";
const clanInvites = new Map();
const teleporting = new Map();
export var ClansUI;
(function (ClansUI) {
    function createClan(player) {
        const form = new ModalFormData();
        form.title(`§aCreate§dClan`);
        form.textField(`Clan Name`, `[a-zA-Z0-9]`);
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (res.formValues[0] !== "")
                PlayerClans.createClan(res.formValues[0].toString(), player);
        });
    }
    ClansUI.createClan = createClan;
    function main(player) {
        var _a;
        const form = new ActionFormData();
        const clan = (_a = PlayerClans.getPlayerClan(player.id)) !== null && _a !== void 0 ? _a : "";
        const clanData = PlayerClans.getClan(clan);
        form.title(`§aClan§dMenu`);
        if (clanData) {
            let isOwner = false;
            form.body(`Clan: §e${clan}§r\nOwner: §b${PlayerName.getName(clanData.owner)}`);
            form.button(`§dMessage§r\n§aClick to msg`, `textures/ui/send_icon.png`);
            form.button(`§dBase§r\n§aClick to teleport`, `textures/items/compass_item.png`);
            form.button(`§dMembers§r\n§aClick to see`, `textures/ui/friend1_black_outline_2x.png`);
            if (clanData.owner === player.id) {
                form.button(`§dSetBase§r\n§aClick to set`, `textures/items/compass_item.png`);
                form.button(`[ §4Delete Clan§r ]`, `textures/ui/realms_red_x.png`);
                isOwner = true;
            }
            else {
                form.button(`[ §cLeave Clan§r ]`, `textures/ui/realms_red_x.png`);
            }
            form.show(player).then((res) => {
                if (res.canceled || res.selection === undefined)
                    return;
                if (res.selection === 0)
                    clanMessage(player);
                if (res.selection === 1)
                    PlayerClans.teleportClanBase(player);
                if (res.selection === 2)
                    clanMembers(player);
                if (isOwner === true) {
                    if (res.selection === 3)
                        PlayerClans.setClanBase(player);
                    if (res.selection === 4)
                        deleteClan(player);
                    return;
                }
                if (res.selection === 3)
                    leaveClan(player);
            });
        }
        else {
            const clan = clanInvites.get(player);
            if (clan) {
                form.body(`§e${clan}§r invited you!`);
                form.button("§2Accept", `textures/ui/realms_green_check.png`);
                form.button("§4Reject", `textures/ui/realms_red_x.png`);
                form.button(`§8[ §cCLOSE §8]`, `textures/blocks/barrier.png`);
                form.show(player).then((res) => {
                    if (res.canceled || res.selection === undefined)
                        return;
                    if (res.selection === 0)
                        PlayerClans.acceptInvite(player);
                    if (res.selection === 1)
                        PlayerClans.rejectInvite(player);
                });
            }
            else {
                form.body(`No clan invite you`);
                form.button(`§8[ §cCLOSE §8]`, `textures/blocks/barrier.png`);
                form.show(player).then((res) => {
                    if (res.canceled || res.selection === undefined || res.selection === 0)
                        return;
                });
            }
        }
    }
    ClansUI.main = main;
    function setTeleportTimeout(player) {
        const form = new ModalFormData();
        form.title(`§dTimeout§aSet`);
        form.textField(`Timeout:`, `-1 to Delete Timeout`);
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (Number.isNaN(res.formValues[0]) || +res.formValues[0] !== +res.formValues[0]) {
                player.sendMessage(`§cInvalid value`);
                return;
            }
            Config.setConfig("clans.timeout", parseInt(res.formValues[0].toString()));
        });
    }
    ClansUI.setTeleportTimeout = setTeleportTimeout;
    function deleteClan(player) {
        const form = new MessageFormData();
        form.title("§aClan§4Delete");
        form.body("Are you sure you want to §4Delete§r this clan?");
        form.button1("§8[ §cCANCEL §8]");
        form.button2("§l§4Delete");
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === 1)
                PlayerClans.deleteClan(player);
        });
    }
    ClansUI.deleteClan = deleteClan;
    function leaveClan(player) {
        const form = new MessageFormData();
        form.title("§aClan§4Leave");
        form.body("Are you sure you want to §cLeave§r this clan?");
        form.button1("§8[ §cCANCEL §8]");
        form.button2("§l§4Leave");
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === 1)
                PlayerClans.leaveClanMember(player);
        });
    }
    ClansUI.leaveClan = leaveClan;
    function clanMessage(player) {
        const form = new ModalFormData();
        form.title("§aClan§dChat");
        form.textField(`Message`, "Hello World!");
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (typeof res.formValues[0] === "string")
                PlayerClans.clanPlayerSendMessage(player, res.formValues[0]);
        });
    }
    ClansUI.clanMessage = clanMessage;
    function clanMembers(player) {
        var _a;
        const form = new ActionFormData();
        const clan = (_a = PlayerClans.getPlayerClan(player.id)) !== null && _a !== void 0 ? _a : "";
        const clanData = PlayerClans.getClan(clan);
        form.title("§aClan§dMembers");
        if (clanData) {
            const members = clanData.members;
            let isOwner = false;
            form.body(`§e${clan}§r Members`);
            for (const memberId of members) {
                const member = world.getPlayers().find((v) => v.id === memberId);
                if (member)
                    form.button(`§d${member.name}§r\n§aOnline`, `textures/ui/friend1_black_outline_2x.png`);
                else
                    form.button(`§d${PlayerName.getName(memberId)}§r\n§8Offline`, `textures/ui/friend_glyph_desaturated.png`);
            }
            if (clanData.owner === player.id) {
                form.button(`§2Invite Member§r\n§dClick to Invite`, `textures/ui/book_shiftright_default.png`);
                isOwner = true;
            }
            form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
            form.show(player).then((res) => {
                if (res.canceled || res.selection === undefined)
                    return;
                if (isOwner) {
                    if (res.selection === members.length) {
                        inviteMember(player);
                        return;
                    }
                    if (res.selection === members.length + 1) {
                        main(player);
                        return;
                    }
                }
                if (isOwner === false && res.selection === members.length) {
                    main(player);
                    return;
                }
                clanMember(player, members[res.selection]);
            });
        }
        else {
            form.body(`You don't have a clan!`);
            form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
            form.show(player).then((res) => {
                if (res.canceled || res.selection === undefined)
                    return;
                if (res.selection === 0) {
                    main(player);
                    return;
                }
            });
        }
    }
    ClansUI.clanMembers = clanMembers;
    function inviteMember(player) {
        var _a;
        const form = new ActionFormData();
        const clan = (_a = PlayerClans.getPlayerClan(player.id)) !== null && _a !== void 0 ? _a : "";
        const clanData = PlayerClans.getClan(clan);
        form.title("§aInvite§dMembers");
        if (clanData) {
            const players = world.getPlayers().filter((v) => PlayerClans.getPlayerClan(v.id) !== clan);
            form.body(`Invite Player to join §e${clan}§r clan Members`);
            for (const member of players) {
                form.button(`§d${member.name}§r\n§aInvite Clan!`, `textures/ui/friend1_black_outline_2x.png`);
            }
            form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
            form.show(player).then((res) => {
                if (res.canceled || res.selection === undefined)
                    return;
                if (res.selection === players.length) {
                    main(player);
                    return;
                }
                PlayerClans.inviteMember(player, players[res.selection]);
            });
        }
        else {
            form.body(`You don't have a clan!`);
            form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
            form.show(player).then((res) => {
                if (res.canceled || res.selection === undefined)
                    return;
                if (res.selection === 0) {
                    main(player);
                    return;
                }
            });
        }
    }
    ClansUI.inviteMember = inviteMember;
    function clanMember(player, memberId) {
        const form = new ActionFormData();
        const clan = PlayerClans.getPlayerClan(memberId);
        if (clan) {
            const owner = PlayerClans.getClanOwner(clan);
            let isOnline = false;
            let isOwner = false;
            form.title(`§e${clan}§r Member`);
            form.body(`Name: §b${PlayerName.getName(memberId)}§r\nMoney§r: §e${config.currency}${ScoreCounts.getPlayerMoney(memberId)}§r\nKills§r: §d${ScoreCounts.getPlayerKills(memberId)}§r\nDeath§r: §d${ScoreCounts.getPlayerDeath(memberId)}§r\nMonster Kills§r: §d${ScoreCounts.getMonsterKills(memberId)}§r\nMob Kills§r: §d${ScoreCounts.getMobKills(memberId)}§r`);
            if (world.getPlayers().find((v) => v.id === memberId)) {
                form.button(`§dTPA§r\n§aClick to teleport`, `textures/ui/multiplayer_glyph_color.png`);
                isOnline = true;
            }
            if (player.id === owner) {
                form.button(`§dKick Member§r\n§aClick to remove`, `textures/ui/realms_red_x.png`);
                isOwner = true;
            }
            form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
            form.show(player).then((res) => {
                if (res.canceled || res.selection === undefined)
                    return;
                if (isOnline) {
                    const member = world.getPlayers().find((v) => v.id === memberId);
                    if (res.selection === 0) {
                        if (member)
                            TPA.teleportRequest(player, member);
                        else
                            player.sendMessage(`[TPA] §cPlayer offline!`);
                    }
                    if (res.selection === 1) {
                        if (isOwner)
                            removeClanMember(player, memberId);
                        else
                            clanMembers(player);
                    }
                    return;
                }
                if (res.selection === 0) {
                    if (isOwner)
                        removeClanMember(player, memberId);
                    else
                        clanMembers(player);
                }
            });
        }
        else
            player.sendMessage(`[Clan] §cClan not found!`);
    }
    ClansUI.clanMember = clanMember;
    function removeClanMember(player, memberId) {
        const form = new MessageFormData();
        form.title("§cKick§2Member");
        form.body(`Are you sure you want to §cKick§b ${PlayerName.getName(memberId)}§r from this clan?`);
        form.button1("§8[ §cCANCEL §8]");
        form.button2("§l§4Kick");
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === 1)
                PlayerClans.removeClanMember(player, memberId);
        });
    }
    ClansUI.removeClanMember = removeClanMember;
})(ClansUI || (ClansUI = {}));
export var PlayerClans;
(function (PlayerClans) {
    function getPlayerName(player) {
        const configClanName = config.clans.clan_name;
        const clan = getPlayerClan(player.id);
        if (clan)
            return configClanName.replace(/{clan}/g, clan);
        return "";
    }
    PlayerClans.getPlayerName = getPlayerName;
    function getPlayerChat(player) {
        const configClanName = config.clans.clan_chat;
        const clan = getPlayerClan(player.id);
        if (clan)
            return configClanName.replace(/{clan}/g, clan);
        return "";
    }
    PlayerClans.getPlayerChat = getPlayerChat;
    function clanSendMessage(clan, message) {
        let result = false;
        for (const player of world.getPlayers()) {
            if (getPlayerClan(player.id) === clan) {
                player.sendMessage(`[§e${clan}§r] ${message}`);
                result = true;
            }
        }
        return result;
    }
    PlayerClans.clanSendMessage = clanSendMessage;
    function clanPlayerSendMessage(player, message) {
        if (message === "" || message === " ".repeat(message.length))
            return;
        const clan = getPlayerClan(player.id);
        if (!clan) {
            player.sendMessage(`[Clan] §cYou don't have a Clan!`);
            return;
        }
        let clanData = getClan(clan);
        if (!clanData) {
            player.sendMessage(`[Clan] §cYou don't have a Clan!`);
            return;
        }
        for (const target of world.getPlayers()) {
            if (getPlayerClan(target.id) === clan)
                target.sendMessage(`[§e${clan}§r] §7${player.name}§r §8» §r${message}`);
        }
    }
    PlayerClans.clanPlayerSendMessage = clanPlayerSendMessage;
    function getClans() {
        let clans = [];
        for (const clanName of Database.keys().filter((v) => v.startsWith("clan:")).map((v) => v = v.substring("clan:".length))) {
            const clan = Database.get(`clan:${clanName}`);
            if (typeof clan !== "undefined")
                clans.push([clanName, clan]);
        }
        return clans;
    }
    PlayerClans.getClans = getClans;
    function createClan(clan, owner) {
        const inventory = new PlayerInventory(owner);
        const iteminv = inventory.getContainerItems().find((v) => { var _a; return ((_a = v[0]) === null || _a === void 0 ? void 0 : _a.typeId) === "candra:ticket_clan"; });
        if (!iteminv) {
            owner.sendMessage(`[Clan] §cYou don't have ticket to create!`);
            return false;
        }
        const [item, slot] = iteminv;
        if (!item) {
            owner.sendMessage(`[Clan] §cYou don't have ticket to create!`);
            return false;
        }
        const oldclan = getPlayerClan(owner.id);
        if (oldclan) {
            owner.sendMessage(`[Clan] §cYou are part of §e${oldclan}§c clan`);
            return false;
        }
        const regex = /^[a-zA-Z0-9]+$/;
        if (!regex.test(clan) || clan.length > 12) {
            owner.sendMessage(`[Clan] §cInvalid name!`);
            return false;
        }
        if (getClans().find((v) => v[0] === clan)) {
            owner.sendMessage(`[Clan] §cName already exist!`);
            return false;
        }
        if (item.amount > 1) {
            item.amount -= 1;
            inventory.setItem(slot, item);
        }
        if (item.amount === 1) {
            inventory.container().setItem(slot);
        }
        let data = {
            owner: owner.id,
            members: [],
        };
        Database.set(`clan:${clan}`, data);
        owner.sendMessage(`[Clan] §aSuccess to create §e${clan}§a clan`);
        return true;
    }
    PlayerClans.createClan = createClan;
    function deleteClan(owner) {
        const clan = getPlayerClan(owner.id);
        if (!clan) {
            owner.sendMessage(`[Clan] §cNo clan to delete`);
            return false;
        }
        const clanData = getClan(clan);
        if (!clanData || clanData.owner !== owner.id) {
            owner.sendMessage(`[Clan] §cYou don't have permission to delete this clan`);
            return false;
        }
        clanSendMessage(clan, `§b${owner.name}§r§c has been delete §e${clan}§c clan`);
        Database.set(`clan:${clan}`);
        return true;
    }
    PlayerClans.deleteClan = deleteClan;
    function getClan(clan) {
        var _a, _b;
        return (_b = (_a = getClans().find((v) => v[0] === clan)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null;
    }
    PlayerClans.getClan = getClan;
    function getClanOwner(clan) {
        const rawclan = Database.get(`clan:${clan}`);
        if (!rawclan)
            return null;
        const clanData = rawclan;
        return clanData.owner;
    }
    PlayerClans.getClanOwner = getClanOwner;
    function getClanMembers(clan) {
        const rawclan = Database.get(`clan:${clan}`);
        if (!rawclan)
            return [];
        const clanData = rawclan;
        return clanData.members;
    }
    PlayerClans.getClanMembers = getClanMembers;
    function hasClanMember(clan, id) {
        const clanData = getClan(clan);
        if (!clanData)
            return false;
        return clanData.members.includes(id);
    }
    PlayerClans.hasClanMember = hasClanMember;
    function setClanBase(owner) {
        const clan = getPlayerClan(owner.id);
        if (!clan) {
            owner.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        let clanData = getClan(clan);
        if (!clanData) {
            owner.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        if (clanData.owner !== owner.id) {
            owner.sendMessage(`[Clan] §cYou don't have permission!`);
            return false;
        }
        let pos = {
            x: Math.floor(owner.location.x) + 0.5,
            y: Math.floor(owner.location.y) + 0.35,
            z: Math.floor(owner.location.z) + 0.5,
        };
        let dimensionId = owner.dimension.id;
        let blockpos = {
            pos: pos,
            dimensionId: dimensionId,
        };
        clanData.base = blockpos;
        Database.set(`clan:${clan}`, clanData);
        clanSendMessage(clan, `§aSet Clan Base §r[ ${pos.x}, ${pos.y}, ${pos.z} ]`);
        return true;
    }
    PlayerClans.setClanBase = setClanBase;
    function deleteClanBase(owner) {
        const clan = getPlayerClan(owner.id);
        if (!clan) {
            owner.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        let clanData = getClan(clan);
        if (!clanData) {
            owner.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        if (clanData.owner !== owner.id) {
            owner.sendMessage(`[Clan] §cYou don't have permission!`);
            return false;
        }
        if (!getClanBase(clan)) {
            owner.sendMessage(`[Clan] §cBase not found!`);
            return false;
        }
        clanData.base = undefined;
        Database.set(`clan:${clan}`, clanData);
        clanSendMessage(clan, `§eDelete Clan Base`);
        return true;
    }
    PlayerClans.deleteClanBase = deleteClanBase;
    function getClanBase(clan) {
        var _a;
        const clanData = getClan(clan);
        if (!clanData)
            return null;
        return (_a = clanData.base) !== null && _a !== void 0 ? _a : null;
    }
    PlayerClans.getClanBase = getClanBase;
    function teleportClanBase(player) {
        const clan = getPlayerClan(player.id);
        if (!clan) {
            player.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        const clanData = getClan(clan);
        if (!clanData) {
            player.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        const base = clanData.base;
        if (!base) {
            player.sendMessage(`[Clan] §cBase not found!`);
            return false;
        }
        let timeout = config.clans.timeout;
        const posFix = CenterPos(base.pos);
        if (timeout <= 0)
            timeout = undefined;
        if (timeout) {
            player.sendMessage(`[Clan] §aTeleporting to §r${clan} Base§a in §r${timeout}§a seaconds`);
            teleporting.set(player.name, player);
            const wait = system.runTimeout(() => {
                if (teleporting.has(player.name)) {
                    teleporting.delete(player.name);
                    player.teleport(posFix, {
                        dimension: world.getDimension(base.dimensionId),
                    });
                    player.sendMessage(`[Clan] §aTeleported!`);
                }
            }, timeout * 20);
            world.beforeEvents.playerLeave.subscribe((ev) => {
                if (ev.player === player)
                    system.clearRun(wait);
            });
            return true;
        }
        player.teleport(posFix, {
            dimension: world.getDimension(base.dimensionId),
        });
        player.sendMessage(`[Clan] §aTeleported to §r${clan} Base`);
        return true;
    }
    PlayerClans.teleportClanBase = teleportClanBase;
    function inviteMember(owner, member) {
        const clan = getPlayerClan(owner.id);
        if (!clan) {
            owner.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        const clanData = getClan(clan);
        if (!clanData) {
            owner.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        if (clanData.owner !== owner.id) {
            owner.sendMessage(`[Clan] §cYou don't have permission!`);
            return false;
        }
        if (clanData.owner === member.id) {
            owner.sendMessage(`[Clan] §cHes is owner of this clan`);
            return false;
        }
        if (clanData.members.includes(member.id)) {
            owner.sendMessage(`[Clan] §cPlayer already exist in this clan`);
            return false;
        }
        if (getPlayerClan(member.id)) {
            owner.sendMessage(`[Clan] §cPlayer already exist in other clan`);
            return false;
        }
        if (clanInvites.get(member) === clan) {
            owner.sendMessage(`[Clan] §cPlayer has been invited to this clan!`);
            return false;
        }
        if (clanInvites.has(member)) {
            owner.sendMessage(`[Clan] §cPlayer has been invited to other clan`);
            return false;
        }
        clanInvites.set(member, clan);
        owner.sendMessage(`[Clan] §b${member.name}§r§a has been invite to join §e${clan}§a`);
        member.sendMessage(`[Clan] §b${owner.name} §r§ainvited you to join §e${clan}§a. §cInvited lost in §e30s`);
        const timeout = system.runTimeout(() => {
            var _a;
            if (clanInvites.get(member) === clan) {
                (_a = world.getPlayers().find((v) => v.id === clanData.owner)) === null || _a === void 0 ? void 0 : _a.sendMessage(`[Clan] §cInvited §b${member.name}§c to join §e${clan}§c has disappeared`);
                member.sendMessage(`[Clan] §cInvite to join §e${clan}§c has disappeared`);
                clanInvites.delete(member);
            }
        }, 600);
        world.beforeEvents.playerLeave.subscribe((ev) => {
            var _a;
            if (ev.player === member && clanInvites.has(member)) {
                (_a = world.getPlayers().find((v) => v.id === clanData.owner)) === null || _a === void 0 ? void 0 : _a.sendMessage(`[Clan] §cInvited §b${member.name}§c to join §e${clan}§c has disappeared`);
                clanInvites.delete(member);
                system.clearRun(timeout);
            }
        });
        return true;
    }
    PlayerClans.inviteMember = inviteMember;
    function acceptInvite(player) {
        const clan = clanInvites.get(player);
        if (!clan) {
            player.sendMessage(`[Clan] §cNo clan invited you`);
            return false;
        }
        let clanData = getClan(clan);
        if (!clanData) {
            player.sendMessage(`[Clan] §cNo clan invited you`);
            return false;
        }
        if (clanData.owner === player.id) {
            player.sendMessage(`[Clan] §cYou are owner in this clan`);
            return false;
        }
        if (clanData.members.includes(player.id)) {
            player.sendMessage(`[Clan] §cYou already exist in this clan`);
            return false;
        }
        if (getPlayerClan(player.id)) {
            player.sendMessage(`[Clan] §cYou already exist in other clan!`);
            return false;
        }
        clanData.members.push(player.id);
        Database.set(`clan:${clan}`, clanData);
        clanInvites.delete(player);
        clanSendMessage(clan, `§b${player.name}§r§a Joined the clan!`);
        return true;
    }
    PlayerClans.acceptInvite = acceptInvite;
    function rejectInvite(player) {
        var _a;
        const clan = clanInvites.get(player);
        if (!clan) {
            player.sendMessage(`[Clan] §cNo clan invited you`);
            return false;
        }
        const clanData = getClan(clan);
        if (!clanData) {
            player.sendMessage(`[Clan] §cNo clan invited you`);
            return false;
        }
        (_a = world.getPlayers().find((v) => v.id === clanData.owner)) === null || _a === void 0 ? void 0 : _a.sendMessage(`[Clan] §cInvited §b${player.name}§c to join §e${clan}§c has been reject`);
        player.sendMessage(`[Clan] §aInvite to join §e${clan}§c has been reject`);
        clanInvites.delete(player);
        return true;
    }
    PlayerClans.rejectInvite = rejectInvite;
    function leaveClanMember(player) {
        const clan = getPlayerClan(player.id);
        if (!clan) {
            player.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        let clanData = getClan(clan);
        if (!clanData) {
            player.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        if (clanData.owner === player.id) {
            player.sendMessage(`[Clan] §cYou are owner in this clan`);
            return false;
        }
        clanSendMessage(clan, `§b${player.name}§r§c leave the clan!`);
        clanData.members = clanData.members.filter((v) => v !== player.id);
        Database.set(`clan:${clan}`, clanData);
        return true;
    }
    PlayerClans.leaveClanMember = leaveClanMember;
    function removeClanMember(owner, memberId) {
        const clan = getPlayerClan(memberId);
        if (!clan) {
            owner.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        let clanData = getClan(clan);
        if (!clanData) {
            owner.sendMessage(`[Clan] §cClan not found!`);
            return false;
        }
        if (clanData.owner === memberId) {
            owner.sendMessage(`[Clan] §cYou are owner in this clan`);
            return false;
        }
        if (!clanData.members.includes(memberId)) {
            owner.sendMessage(`[Clan] §cMember not found!`);
            return false;
        }
        clanSendMessage(clan, `§b${PlayerName.getName(memberId)}§r§c has been kick from this clan!`);
        clanData.members = clanData.members.filter((v) => v !== memberId);
        Database.set(`clan:${clan}`, clanData);
        return true;
    }
    PlayerClans.removeClanMember = removeClanMember;
    function getPlayerClan(id) {
        let playerClan = null;
        for (const clan of getClans()) {
            if (clan[1].owner === id) {
                playerClan = clan[0];
                continue;
            }
            if (clan[1].members.includes(id)) {
                playerClan = clan[0];
                continue;
            }
        }
        return playerClan;
    }
    PlayerClans.getPlayerClan = getPlayerClan;
})(PlayerClans || (PlayerClans = {}));
world.afterEvents.itemUse.subscribe((ev) => {
    if (ev.itemStack.typeId === "candra:ticket_clan") {
        system.run(() => {
            ClansUI.createClan(ev.source);
        });
    }
});
world.beforeEvents.playerLeave.subscribe((ev) => {
    var _a;
    for (const [member, clan] of clanInvites.entries()) {
        if (ev.player === member) {
            const clanData = PlayerClans.getClan(clan);
            if (!clanData) {
                clanInvites.delete(member);
                return;
            }
            (_a = world.getPlayers().find((v) => v.id === clanData.owner)) === null || _a === void 0 ? void 0 : _a.sendMessage(`[Clan] §cInvited §b${member.name}§c to join §e${clan}§c has disappeared`);
            clanInvites.delete(member);
        }
    }
});
