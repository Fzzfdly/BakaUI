import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { config } from "./config";
export var Pay;
(function (Pay) {
    function MainUI(player) {
        const form = new ActionFormData();
        const players = world.getAllPlayers().filter((v) => v !== player);
        form.title("§l§dTransfer");
        form.body(`Select player to transfer:`);
        for (const target of players) {
            form.button(`${target.name}§r\n§aClick to transfer`, "textures/ui/icon_agent.png");
        }
        form.button(`§8[ §cCANCEL §8]`, `textures/blocks/barrier.png`);
        form.show(player).then((res) => {
            if (res.canceled || res.selection === undefined)
                return;
            if (res.selection >= players.length)
                return;
            const target = players[res.selection];
            PayUI(player, target);
        });
    }
    Pay.MainUI = MainUI;
    function PayUI(player, target) {
        const form = new ModalFormData();
        form.title(`§aPlayer§2Transfer`);
        form.textField(`Target: §d${target.name}§r\n\nAmount`, "100");
        form.show(player).then((res) => {
            if (res.canceled || res.formValues === undefined)
                return;
            if (res.formValues[0]) {
                if (Number.isNaN(res.formValues[0])) {
                    player.sendMessage(`[Pay] §cInvalid amount!`);
                    return;
                }
                else
                    transfer(player, target, Number(res.formValues[0]));
            }
        });
    }
    Pay.PayUI = PayUI;
    function transfer(player, target, amount) {
        var _a;
        if (amount <= 0 || Number.isNaN(amount)) {
            player.sendMessage(`[Pay] §cInvalid amount!`);
            return false;
        }
        if (player === target) {
            player.sendMessage(`[Pay] §cCannot transfer to yourself`);
            return false;
        }
        const objective = world.scoreboard.getObjective(config.objective);
        if (!objective) {
            player.sendMessage(`[Pay] §cObjective not found!`);
            return false;
        }
        const playerScore = (_a = objective.getScore(player)) !== null && _a !== void 0 ? _a : 0;
        if ((playerScore - amount) <= 0) {
            player.sendMessage(`[Pay] §cNot enough money!`);
            return false;
        }
        amount = (amount * 10 / 10);
        objective.setScore(player, playerScore - amount);
        objective.addScore(target, amount);
        player.sendMessage(`[Pay] §atransferred §e${config.currency}${formatNumber(amount)} §ato §b${target.name}`);
        target.sendMessage(`[Pay] §b${player.name} §atransferred §e${config.currency}${formatNumber(amount)}§a to you`);
        return true;
    }
    Pay.transfer = transfer;
})(Pay || (Pay = {}));
function formatNumber(num) {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.log10(Math.abs(num)) / 3 | 0;
    if (tier === 0)
        return num.toString();
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaledNum = num / scale;
    return scaledNum.toFixed(1) + suffix;
}
