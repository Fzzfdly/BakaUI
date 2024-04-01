import { system, world } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { Config, config } from "./config";
import { Database } from "./utils/database";
import { CenterPos } from "./pos";
const teleporting = new Map();
const teleportTimeout = new Map();
export var WarpUI;
(function (WarpUI) {
    function main(player) {
        const form = new ActionFormData();
        const warps = Warp.getWarps();
        form.title(`§l§6Warp §fUI`);
        form.body(`Select where you want to teleport`);
        for (const warp of warps) {
            form.button(`§l§a${warp.name}§r\n§8Click to teleport!`, `textures/ui/pointer.png`);
        }
        form.button(`§8[ §cExit §8]`, `textures/blocks/barrier.png`);
        form.show(player).then((res) => {
            if (res.selection === undefined || res.selection >= warps.length)
                return;
            if (warps[res.selection] !== null) {
                Warp.teleport(player, warps[res.selection].name);
            }
        });
    }
    WarpUI.main = main;
    function admin(player) {
        const form = new ActionFormData();
        form.title(`§l§6Warp §fAdmin`);
        form.button("§aSet Local Warp");
        form.button("§aDelete Warp");
        form.button("§aTeleport Timeout");
        form.button("§aSet Warp");
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === 0)
                setLocalWarp(player);
            if (res.selection === 1)
                deleteWarp(player, admin);
            if (res.selection === 2)
                setTeleportTimeout(player);
            if (res.selection === 3)
                setDetailWarp(player);
        });
    }
    WarpUI.admin = admin;
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
            Config.setConfig("warp.timeout", parseInt(res.formValues[0].toString()));
        });
    }
    WarpUI.setTeleportTimeout = setTeleportTimeout;
    function setLocalWarp(player) {
        const form = new ModalFormData();
        form.title(`§dWarp§aSet`);
        form.textField(`Warp:`, `Warp Name`);
        form.toggle(`Floating Name`, true);
        form.show(player).then((res) => {
            if (res.formValues === undefined || res.canceled)
                return;
            const name = res.formValues[0];
            const pos = player.location;
            const dimensionId = player.dimension.id;
            const floating_name = Boolean(res.formValues[1]);
            Warp.setWarp(`${name}`, pos, dimensionId, floating_name, player);
        });
    }
    WarpUI.setLocalWarp = setLocalWarp;
    function setDetailWarp(player) {
        const form = new ModalFormData();
        form.title(`§dWarp§aSet`);
        form.textField("Warp", "Warp Name");
        form.textField("X", "(optional)", player.location.x.toString());
        form.textField("Y", "(optional)", player.location.y.toString());
        form.textField("Z", "(optional)", player.location.z.toString());
        form.dropdown("Dimension (optional)", [
            "Overworld",
            "Nether",
            "The End",
        ]);
        form.toggle(`Floating Name`, true);
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (Number.isNaN(res.formValues[1]) || Number.isNaN(res.formValues[2]) || Number.isNaN(res.formValues[3])) {
                player.sendMessage(`§cInvalid position!`);
                return;
            }
            const name = `${res.formValues[0]}`;
            const x = Number(res.formValues[1]);
            const y = Number(res.formValues[2]);
            const z = Number(res.formValues[3]);
            const dimensionId = [
                "minecraft:overworld",
                "minecraft:nether",
                "minecraft:the_end",
            ][+res.formValues[4]];
            const floating_name = Boolean(res.formValues[5]);
            Warp.setWarp(name, { x, y, z }, dimensionId, floating_name, player);
        });
    }
    WarpUI.setDetailWarp = setDetailWarp;
    function deleteWarp(player, callback) {
        const form = new ActionFormData();
        const warps = Warp.getWarps();
        form.title(`§l§fWarp Delete`);
        form.body(`Select the warp you want to Delete`);
        for (const warp of warps) {
            form.button(`§l§a${warp.name}§r\n§8Click to delete!`, `textures/ui/pointer.png`);
        }
        form.button(`§8[ §cBACK §8]`, `textures/blocks/barrier.png`);
        form.show(player).then((res) => {
            if (res.selection === undefined || res.selection >= warps.length)
                return;
            if (res.selection === warps.length)
                callback(player);
            if (warps[res.selection] !== null) {
                const warp = warps[res.selection];
                WarpUI.deleteWarpConfirm(player, warp.name);
            }
        });
    }
    WarpUI.deleteWarp = deleteWarp;
    function deleteWarpConfirm(player, name) {
        const data = Warp.getWarp(name);
        if (!data) {
            player.sendMessage(`§d${name} §r§cnot found!`);
            return;
        }
        const pos = data === null || data === void 0 ? void 0 : data.pos;
        const dimensionId = player.dimension.id;
        const form = new MessageFormData();
        form.title(`§dWarp§aConfirm`);
        form.body(`Do you want to delete this warp:\n\n  Name: §2${name}§r`);
        form.button1("§cNo");
        form.button2("§l§4Delete");
        form.show(player).then((res) => {
            if (res.selection === 1)
                Warp.deleteWarp(name, player);
        });
    }
    WarpUI.deleteWarpConfirm = deleteWarpConfirm;
})(WarpUI || (WarpUI = {}));
export var Warp;
(function (Warp) {
    function getWarps() {
        const data = Database.get("candra:warp");
        if (!data)
            return [];
        return data;
    }
    Warp.getWarps = getWarps;
    function getWarp(name) {
        var _a;
        const warps = getWarps();
        return (_a = warps.find((v) => v.name === name)) !== null && _a !== void 0 ? _a : null;
    }
    Warp.getWarp = getWarp;
    function hasWarp(name) {
        const warps = getWarps();
        return warps.some((v) => v.name === name);
    }
    Warp.hasWarp = hasWarp;
    function setWarp(name, pos, dimensionId, floating_name = true, author) {
        const regex = /^[a-zA-Z0-9\s]+$/;
        let warps = Warp.getWarps();
        const warp = warps.findIndex((v) => v.name === name);
        pos = {
            x: Math.floor(pos.x),
            y: Math.floor(pos.y),
            z: Math.floor(pos.z),
        };
        if (name === "" || !regex.test(name)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Warp] §cInvalid name!`);
            return false;
        }
        if (warp >= 0) {
            warps[warp].pos = pos;
            warps[warp].dimensionId = dimensionId;
            warps[warp].floating_name = floating_name;
            Database.set("candra:warp", warps);
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Warp] §aSuccess to move §d${name} §r§awarp position`);
            return true;
        }
        ;
        let data = {
            name: name,
            pos: pos,
            dimensionId: dimensionId,
            floating_name: floating_name,
        };
        warps.push(data);
        Database.set("candra:warp", warps);
        author === null || author === void 0 ? void 0 : author.sendMessage(`[Warp] §aSuccess to create §d${name} §r§awarp`);
        return true;
    }
    Warp.setWarp = setWarp;
    function deleteWarp(name, author) {
        let warps = Warp.getWarps();
        const warp = warps.findIndex((v) => v.name === name);
        if (warp >= 0) {
            warps = warps.filter((v, i) => i !== warp);
            Database.set("candra:warp", warps);
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Warp] §aSuccess to delete §d${name} §r§awarp`);
            return true;
        }
        else {
            author === null || author === void 0 ? void 0 : author.sendMessage(`[Warp] §d${name}§r§c not found`);
            return false;
        }
    }
    Warp.deleteWarp = deleteWarp;
    function setFloatingName(name, value, author) {
        let warps = Warp.getWarps();
        const warp = warps.findIndex((v) => v.name === name);
        if (warp >= 0) {
            warps[warp].floating_name = value;
            Database.set("candra:warp", warps);
            author === null || author === void 0 ? void 0 : author.sendMessage(`§aSuccess set floating text for §d${name} §r§awarp`);
            return true;
        }
        else {
            author === null || author === void 0 ? void 0 : author.sendMessage(`§d${name}§r§c not found`);
            return false;
        }
    }
    Warp.setFloatingName = setFloatingName;
    function teleport(player, name) {
        const data = getWarp(name);
        if (!data) {
            player.sendMessage(`§cWarp not found!`);
            return false;
        }
        const posFix = CenterPos(data.pos);
        let timeout = config.warp.timeout;
        if (timeout <= 0)
            timeout = undefined;
        if (timeout) {
            player.sendMessage(`§aTeleporting to §r${data.name}§a in ${timeout}§a seconds`);
            teleporting.set(player.name, player);
            let wait = system.runTimeout(() => {
                if (teleporting.has(player.name)) {
                    teleporting.delete(player.name);
                    player.teleport(posFix, {
                        dimension: world.getDimension(data.dimensionId),
                    });
                    player.sendMessage(`§aTeleported!`);
                }
                teleportTimeout.delete(player);
            }, timeout * 20);
            teleportTimeout.set(player, wait);
            return true;
        }
        player.teleport(posFix, {
            dimension: world.getDimension(data.dimensionId),
        });
        player.sendMessage(`§aTeleported to §r${data.name}`);
        return true;
    }
    Warp.teleport = teleport;
    function update() {
        for (const player of world.getAllPlayers()) {
            if (teleporting.has(player.name)) {
                if (player.isFalling || player.isClimbing || player.isGliding || player.isJumping || player.isSprinting || player.isSwimming) {
                    teleporting.delete(player.name);
                    player.sendMessage(`§cPlease dont move!`);
                }
            }
        }

        for (const data of Warp.getWarps().filter((v) => v.floating_name)) {
            try {
                const name = data.name;
                const warp = Warp.getWarp(name);
                if (!warp) {
                    const entities = world.getDimension(data.dimensionId).getEntities({
                        type: "minecraft:egg",
                        families: ["inanimate"]
                    });
                    for (const entity of entities.filter((v) => (v.hasTag("candra:warp") && v.hasTag(`warp:${name}`)))) {
                        entity.teleport({ x: 0, y: -100, z: 0 });
                        entity.kill();
                        Warp.deleteWarp(name);
                    }
                }
                else {
                    const entities = world.getDimension(warp.dimensionId).getEntities({
                        type: "minecraft:egg",
                        families: ["inanimate"]
                    });
                    const dimensionId = warp.dimensionId;
                    let pos = CenterPos(warp.pos);
                    pos.y += 0.5;
                    if (!(entities.find((v) => (v.hasTag("candra:warp") && v.hasTag(`warp:${warp.name}`))))) {
                        const entity = world.getDimension(dimensionId).spawnEntity("minecraft:egg<candra:pointer>", pos);
                        entity.addTag("candra:warp");
                        entity.addTag(`warp:${warp.name}`);
                        entity.teleport(pos, { dimension: world.getDimension(dimensionId) });
                        entity.nameTag = `§d»§r§aWARP§d«§r\n§b⌈§r${warp.name}§b⌋`;
                    }
                    let kill = false;
                    for (const entity of entities.filter((v) => (v.hasTag("candra:warp") && v.hasTag(`warp:${warp.name}`)))) {
                        if (kill) {
                            entity.teleport({ x: 0, y: -100, z: 0 });
                            entity.kill();
                        }
                        else {
                            entity.teleport(pos, { dimension: world.getDimension(dimensionId) });
                            entity.nameTag = `§d»§r§aWARP§d«§r\n§b⌈§r${warp.name}§b⌋`;
                            kill = true;
                        }
                    }
                }
            }
            catch (err) { }
        }
        const entities = world.getDimension("overworld").getEntities({
            type: "minecraft:egg",
            families: ["inanimate"]
        });
        for (const entity of entities.filter((v) => (v.hasTag("candra:warp")))) {
            let tag = entity.getTags().find((v) => v.startsWith("warp:"));
            if (!tag) {
                entity.teleport({ x: 0, y: -100, z: 0 });
                entity.kill();
            }
            else if (!Warp.getWarps().filter((v) => v.floating_name).find((v) => `warp:${v.name}` === tag)) {
                entity.teleport({ x: 0, y: -100, z: 0 });
                entity.kill();
            }
        }
    }
    Warp.update = update;
})(Warp || (Warp = {}));
world.beforeEvents.playerLeave.subscribe((ev) => {
    const timeout = teleportTimeout.get(ev.player);
    if (timeout) {
        system.clearRun(timeout);
        teleportTimeout.delete(ev.player);
    }
});
system.runInterval(() => {
    system.run(() => {
        Warp.update();
    });
});
