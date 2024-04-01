import { world } from "@minecraft/server";
export var PlayerSit;
(function (PlayerSit) {
    function startSit(player) {
        const dimension = world.getDimension(player.dimension.id);
        for (const entity of dimension.getEntities({
            type: "minecraft:egg",
            families: ["inanimate"]
        }).filter((v) => (v.hasTag("candra:sit") && v.hasTag(`sit:${player.name}`)))) {
            entity.teleport({ x: 0, y: -10, z: 0 });
            entity.kill();
        }
        const block = dimension.getBlock(player.location);
        if (!block || block.isLiquid)
            return;
        let pos = {
            x: Math.floor(block.location.x) + 0.5,
            y: Math.floor(block.location.y) + 0.35,
            z: Math.floor(block.location.z) + 0.5,
        };
        if (block.isAir) {
            const newBlock = dimension.getBlock({ x: pos.x, y: Math.floor(pos.y) - 1, z: pos.z });
            if (!newBlock || newBlock.isAir || newBlock.isLiquid)
                return;
            pos.y = Math.floor(pos.y) - 0.15;
        }
        const entity = dimension.spawnEntity("minecraft:egg<candra:ride>", pos);
        entity.addTag(`candra:sit`);
        entity.addTag(`sit:${player.name}`);
        player.runCommandAsync(`ride @s start_riding @e[tag=sit:${player.name}]`);
    }
    PlayerSit.startSit = startSit;
})(PlayerSit || (PlayerSit = {}));
