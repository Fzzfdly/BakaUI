import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
const teleports = new Map();
const teleportTimeout = new Map();
export var TPAUI;
(function (TPAUI) {
    function main(player) {
        const form = new ActionFormData();
        const reqTP = TPA.getRequestTeleport(player);
        const tpReq = TPA.getTeleportRequest(player);
        form.title(`§lTeleport`);
        if (reqTP) {
            form.body(`§aRequest teleport to §b${reqTP.name}`);
            form.button(`§4Cancel`, "textures/ui/realms_red_x.png");
        }
        else if (tpReq) {
            form.body(`§b${tpReq.name} §rrequested to teleport to you`);
            form.button(`§2Accept`, "textures/ui/realms_slot_check.png");
            form.button(`§4Reject`, "textures/ui/realms_red_x.png");
        }
        else
            form.body(`No teleport request`);
        form.button(`§lRequest Teleport`, "textures/ui/book_shiftleft_default.png");
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (reqTP) {
                if (res.selection === 0)
                    TPA.cancelRequestTeleport(player);
                if (res.selection === 1)
                    TPAUI.request(player, main);
                return;
            }
            if (tpReq) {
                if (res.selection === 0)
                    TPA.acceptTeleportRequest(player);
                if (res.selection === 1)
                    TPA.rejectTeleportRequest(player);
                if (res.selection === 2)
                    TPAUI.request(player, main);
                return;
            }
            if (res.selection === 0) {
                TPAUI.request(player, main);
                return;
            }
        });
    }
    TPAUI.main = main;
    function request(player, callback) {
        const form = new ActionFormData();
        const players = world.getAllPlayers().filter((v) => v !== player);
        form.body(`Request teleport to other player`);
        for (const target of players) {
            form.button(`${target.name}§r\n§aClick to teleport`, "textures/ui/icon_agent.png");
        }
        form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection >= players.length) {
                callback(player);
                return;
            }
            const target = players[res.selection];
            TPA.teleportRequest(player, target);
        });
    }
    TPAUI.request = request;
})(TPAUI || (TPAUI = {}));
export var TPA;
(function (TPA) {
    function getTeleportRequest(player) {
        var _a;
        return (_a = teleports.get(player)) !== null && _a !== void 0 ? _a : null;
    }
    TPA.getTeleportRequest = getTeleportRequest;
    function getRequestTeleport(player) {
        let target = null;
        for (const data of teleports.entries()) {
            if (data[1] === player)
                target = data[0];
        }
        return target;
    }
    TPA.getRequestTeleport = getRequestTeleport;
    function acceptTeleportRequest(player) {
        const req = teleports.get(player);
        if (!req) {
            player.sendMessage(`[TPA] §cNo one request teleport to you`);
            return;
        }
        req.teleport(player.location, { dimension: player.dimension });
        player.sendMessage(`[TPA] §aRequest accepted!`);
        req.sendMessage(`[TPA] §aTeleported!`);
        teleports.delete(player);
        teleportTimeout.delete(player);
    }
    TPA.acceptTeleportRequest = acceptTeleportRequest;
    function rejectTeleportRequest(player) {
        const req = teleports.get(player);
        if (req) {
            req.sendMessage(`[TPA] §b${player.name} §r§chas been reject your teleport request`);
            player.sendMessage(`[TPA] §aTeleport request from §b${req.name} §r§ahas been reject`);
            teleports.delete(player);
            return;
        }
        player.sendMessage(`[TPA] §aTeleport request has been reject`);
        teleports.delete(player);
    }
    TPA.rejectTeleportRequest = rejectTeleportRequest;
    function cancelRequestTeleport(player) {
        for (const [target, plr] of teleports.entries()) {
            if (plr === player) {
                player.sendMessage(`[TPA] §aCancelled request teleport to §b${target.name}`);
                target.sendMessage(`[TPA] §b${player.name} §r§chas cancel his request`);
                teleports.delete(target);
            }
        }
    }
    TPA.cancelRequestTeleport = cancelRequestTeleport;
    function teleportRequest(player, target) {
        const tpReq = getTeleportRequest(target);
        if (player === target) {
            player.sendMessage(`[TPA] §cCannot teleport to yourself`);
            return false;
        }
        if (tpReq === player) {
            player.sendMessage(`[TPA] §cToo many request`);
            return false;
        }
        if (tpReq) {
            player.sendMessage(`[TPA] §cPlayer is being requested by another Player`);
            return false;
        }
        teleports.set(target, player);
        player.sendMessage(`[TPA] §aRequest teleport to §b${target.name}§r§a, open tpa menu for §cCancel§a. Request lost in §e30s`);
        target.sendMessage(`[TPA] §b${player.name} §r§aRequest teleport to you, open tpa menu for §2Accept§8/§2Reject§a. Request lost in §e30s`);
        let timeout = system.runTimeout(() => {
            if (teleports.get(target) === player) {
                player.sendMessage(`[TPA] §cTeleport request to §b${target.name}§r§c has disappeared`);
                target.sendMessage(`[TPA] §cTeleport request from §b${player.name}§r§c has disappeared`);
                teleports.delete(target);
            }
            teleportTimeout.delete(target);
        }, 600);
        teleportTimeout.set(target, timeout);
        return true;
    }
    TPA.teleportRequest = teleportRequest;
})(TPA || (TPA = {}));
world.beforeEvents.playerLeave.subscribe((ev) => {
    for (const [target, player] of teleports.entries()) {
        const timeout = teleportTimeout.get(target);
        if (ev.player === target) {
            player.sendMessage(`[TPA] §cTeleport request to §b${target.name}§r§c has disappeared`);
            teleports.delete(target);
        }
        if (ev.player === player) {
            target.sendMessage(`[TPA] §cTeleport request from §b${player.name}§r§c has disappeared`);
            teleports.delete(target);
        }
        if (timeout) {
            system.clearRun(timeout);
            teleportTimeout.delete(target);
        }
    }
});
