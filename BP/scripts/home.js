import { system, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { config } from "./config";
import { Database } from "./utils/database";
const teleporting = new Map();
const teleportTimeout = new Map();
export var HomeUI;
(function (HomeUI) {
    function main(player) {
        const form = new ActionFormData();
        const homes = Home.getHomes(player);
        form.title(`§l§fHomeUI`);
        for (const home of homes) {
            form.button(`§f${home.name}§r\n§7Click to Teleport`, "textures/aulonia_icons/home.png");
        }
        form.button(`§aSet Home`, "textures/ui/switch_home_button.png");
        form.button(`§cDelete Home`, "textures/ui/switch_home_button.png");
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === homes.length) {
                setHome(player);
                return;
            }
            if (res.selection === (homes.length + 1)) {
                deleteHome(player, main);
                return;
            }
            Home.teleport(player, homes[res.selection].name);
        });
    }
    HomeUI.main = main;
    function setHome(player) {
        const form = new ModalFormData();
        form.title(`§l§fHome Set`);
        form.textField(`Home`, "MyHome");
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (res.formValues[0])
                Home.setHome(player, `${res.formValues[0]}`);
        });
    }
    HomeUI.setHome = setHome;
    function deleteHome(player, callback) {
        const form = new ActionFormData();
        const homes = Home.getHomes(player);
        form.title(`§l§fHome Delete`);
        for (const home of homes) {
            form.button(`§f${home.name}§r\n§8Click to Delete`, "textures/ui/store_home_icon.png");
        }
        form.button(`§cBack`, "textures/blocks/barrier.png");
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection === homes.length) {
                callback(player);
                return;
            }
            Home.deleteHome(player, homes[res.selection].name);
        });
    }
    HomeUI.deleteHome = deleteHome;
})(HomeUI || (HomeUI = {}));
export var Home;
(function (Home) {
    function getHomes(player) {
        const data = Database.get(`candra:home:${player.id}`);
        if (!data)
            return [];
        return data;
    }
    Home.getHomes = getHomes;
    function getHome(player, name) {
        var _a;
        const warps = getHomes(player);
        return (_a = warps.find((v) => v.name === name)) !== null && _a !== void 0 ? _a : null;
    }
    Home.getHome = getHome;
    function setHome(player, name) {
        const regex = /^[a-zA-Z0-9\s]+$/;
        let homes = Home.getHomes(player);
        const home = homes.findIndex((v) => v.name === name);
        if (name === "" || !regex.test(name) || name.length >= 18) {
            player.sendMessage(`§cInvalid name!`);
            return false;
        }
        let pos = {
            x: Math.floor(player.location.x),
            y: Math.floor(player.location.y),
            z: Math.floor(player.location.z),
        };
        const dimensionId = player.dimension.id;
        if (home >= 0) {
            homes[home].pos = pos;
            homes[home].dimensionId = dimensionId;
            Database.set(`candra:home:${player.id}`, homes);
            player.sendMessage(`§aSuccess to move §f${name} §aposition`);
            return true;
        }
        if (homes.length >= config.home.normal_homelimits) {
            const limits = player.getTags().filter(element => element.startsWith("navperm:home.limit:"));
            let maxLimits = config.home.normal_homelimits;
            for (const limit of limits) {
                const limitNumber = limit.substring("navperm:home.limit:".length);
                if (!Number.isNaN(limitNumber) && maxLimits < Number(limitNumber))
                    maxLimits = Number(limitNumber);
            }
            if (getHomes(player).length >= maxLimits) {
                player.sendMessage(`§cMaximum home limit reached.`);
                return false;
            }
        }
        let data = {
            name: name,
            pos: pos,
            dimensionId: dimensionId,
        };
        homes.push(data);
        Database.set(`candra:home:${player.id}`, homes);
        player.sendMessage(`§aSuccess to create §f${name} §r§ahome`);
        return true;
    }
    Home.setHome = setHome;
    function deleteHome(player, name) {
        let homes = Home.getHomes(player);
        const home = homes.findIndex((v) => v.name === name);
        if (home >= 0) {
            homes = homes.filter((v, i) => i !== home);
            Database.set(`candra:home:${player.id}`, homes);
            player.sendMessage(`§aSuccess to delete §f${name} §r§ahome`);
            return true;
        }
        else {
            player.sendMessage(`§f${name} §cnot found!`);
            return false;
        }
    }
    Home.deleteHome = deleteHome;
    function teleport(player, name) {
        const data = getHome(player, name);
        if (!data) {
            player.sendMessage(`§f${name}§r§c not found!`);
            return false;
        }
        const pos = data.pos;
        const posFix = {
            x: Math.floor(pos.x) + 0.5,
            y: Math.floor(pos.y),
            z: Math.floor(pos.z) + 0.5
        };
        let timeout = config.home.timeout;
        if (timeout <= 0)
            timeout = undefined;
        if (timeout) {
            player.sendMessage(`§aTeleporting to §f${data.name}§a...`);
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
        player.sendMessage(`§aTeleported to §f${data.name}`);
        return true;
    }
    Home.teleport = teleport;
    function update() {
        for (const player of world.getAllPlayers()) {
            if (teleporting.has(player.name)) {
                if (player.isFalling || player.isClimbing || player.isGliding || player.isJumping || player.isSprinting || player.isSwimming) {
                    teleporting.delete(player.name);
                    player.sendMessage(`§cPlease dont move!`);
                }
            }
        }
    }
    Home.update = update;
})(Home || (Home = {}));
world.beforeEvents.playerLeave.subscribe((ev) => {
    const timeout = teleportTimeout.get(ev.player);
    if (timeout) {
        system.clearRun(timeout);
        teleportTimeout.delete(ev.player);
    }
});
system.runInterval(() => {
    system.run(() => {
        Home.update();
    });
});
