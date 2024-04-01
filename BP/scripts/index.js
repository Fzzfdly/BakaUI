import { world, system, ItemStack, ItemLockMode } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PlayerInventory } from "./container";
import { Shop } from "./shopui";
import { TPAUI } from "./tpa";
import { WarpUI } from "./warp";
import { Pay } from "./pay";
import { ClansUI } from "./clans";
import { HomeUI } from "./home";
import { LandUI } from "./land";
import { RankUI } from "./rankperms";
import { PlayerSit } from "./sit"
export { Menu }

world.beforeEvents.itemUse.subscribe(eventData => { //open the bakaui on use
    const player = eventData.source
    if (eventData.itemStack.typeId == 'bakaui:navigator') {
        system.run(() => {
            Menu(player);
            player.runCommand('playsound random.pop @s ~~+1~');
            player.runCommand('scoreboard objectives add money dummy');
        })
    }
});

function menuItem() { //item lock (PLEASE DONT BOTHER THIS SECTION)
    const item = new ItemStack("bakaui:navigator");
    item.keepOnDeath = true;
    item.lockMode = ItemLockMode.slot;
    item.setLore(["§2RightClick: §aFor Open Menu!"]);
    return item;
};

function Menu(player) {

    const ui = new ActionFormData()

    ui.title("§l§fBaka UI§r") //Title
    ui.button("§l§fWarp§r", 'textures/aulonia_icons/warp.png') //0
    ui.button("§l§fShop§r", 'textures/aulonia_icons/shop.png') //1
    ui.button("§l§fUtilities§r", 'textures/aulonia_icons/utilities.png')//0
    if (player.hasTag("admin")) {
        ui.button("§l§fConfig", 'textures/aulonia_icons/config.png');//3
    };

    ui.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        switch (response.selection) {
            case 0: //warp
                WarpUI.main(player); break;
            case 1: //shop
                Shop(player); break;
            case 2: //utilites
                one(player); break;
            case 3: //config
                config(player); break;
        }
    })
};

//function for General
function one(player) {

    const ui = new ActionFormData()
    ui.title("§l§fBaka UI§r") //Title
    ui.button("§l§fHomes§r", 'textures/aulonia_icons/home.png') //0
    ui.button("§l§fLands§r", 'textures/aulonia_icons/land.png') //1
    ui.button("§l§fTPA§r", 'textures/aulonia_icons/tpa.png') //2
    ui.button("§l§fMore§r", 'textures/aulonia_icons/more.png') //3

    ui.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        switch (response.selection) {
            case 0: //home
                HomeUI.main(player); break;
            case 1: //land
                LandUI.main(player); break;
            case 2: // tpa
                TPAUI.main(player); break;
            case 3: //clans
                two(player); break;
        }
    })
}

function two(player) {

    const ui = new ActionFormData()
    ui.title("§l§fBaka UI§r") //Title
    ui.button("§l§fClan§r", 'textures/aulonia_icons/clan.png') //0
    ui.button("§l§fTransfer§r", 'textures/aulonia_icons/transfer.png') //1
    ui.button("§l§fSit§r", 'textures/aulonia_icons/sit.png')//2
    ui.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        switch (response.selection) {
            case 0: //clans
                ClansUI.main(player); break;
            case 1: //transfer
                Pay.MainUI(player); break;
            case 2: //sit
                PlayerSit.startSit(player); break;
        }
    })
}


//function for admins
function config(player) {

    const form = new ActionFormData()
    form.title("§l§fAdmin UI§r")
    form.button("§l§fWarp Admin§r")
    form.button("§l§fRanks§r")
    form.button("§l§fLand Settings§r")
    form.button("§l§fExit§r")
    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        switch (response.selection) {

            case 0:
                WarpUI.admin(player); break;
            case 1:
                RankUI.admin(player); break;
            case 2:
                LandUI.admin(player); break;
            case 3:
                Menu(player); break;
        }
    })
};

world.afterEvents.playerSpawn.subscribe((ev) => {
    const item = menuItem();;
    new PlayerInventory(ev.player).setItem(8, item);
});

