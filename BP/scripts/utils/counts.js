import { system, world } from "@minecraft/server";
import { Database } from "./database";
import { config } from "../config";
export var ScoreCounts;
(function (ScoreCounts) {
    function update() {
        for (const player of world.getPlayers()) {
            setPlayer(player);
        }
    }
    ScoreCounts.update = update;
    function getPlayerId(scoreId) {
        var _a, _b;
        const data = Database.get("candra:scoreids");
        if (typeof data === "object")
            return (_b = (_a = Object.entries(data).find(([kay, id]) => id === scoreId)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : "";
        return "";
    }
    ScoreCounts.getPlayerId = getPlayerId;
    function getScoreId(playerId) {
        var _a;
        const data = Database.get("candra:scoreids");
        if (typeof data === "object")
            return (_a = data[playerId]) !== null && _a !== void 0 ? _a : -1;
        return -1;
    }
    ScoreCounts.getScoreId = getScoreId;
    function getScoreIdentity(scoreId) {
        return world.scoreboard.getParticipants().find((v) => v.id === scoreId);
    }
    ScoreCounts.getScoreIdentity = getScoreIdentity;
    function getPlayerMoney(playerId) {
        const scoreId = getScoreId(playerId);
        const scoreIdentity = world.scoreboard.getParticipants().find((v) => v.id === scoreId);
        if (!scoreIdentity)
            return 0;
        const objective = world.scoreboard.getObjective(config.objective);
        if (!objective)
            return 0;
        const score = objective.getScore(scoreIdentity);
        if (!score)
            return 0;
        return score;
    }
    ScoreCounts.getPlayerMoney = getPlayerMoney;
    function getPlayerDeath(playerId) {
        const scoreId = getScoreId(playerId);
        const scoreIdentity = world.scoreboard.getParticipants().find((v) => v.id === scoreId);
        if (!scoreIdentity)
            return 0;
        const objective = world.scoreboard.getObjective("PlayerDeath");
        if (!objective)
            return 0;
        const score = objective.getScore(scoreIdentity);
        if (!score)
            return 0;
        return score;
    }
    ScoreCounts.getPlayerDeath = getPlayerDeath;
    function getPlayerKills(playerId) {
        const scoreId = getScoreId(playerId);
        const scoreIdentity = world.scoreboard.getParticipants().find((v) => v.id === scoreId);
        if (!scoreIdentity)
            return 0;
        const objective = world.scoreboard.getObjective("PlayerKills");
        if (!objective)
            return 0;
        const score = objective.getScore(scoreIdentity);
        if (!score)
            return 0;
        return score;
    }
    ScoreCounts.getPlayerKills = getPlayerKills;
    function getMonsterKills(playerId) {
        const scoreId = getScoreId(playerId);
        const scoreIdentity = world.scoreboard.getParticipants().find((v) => v.id === scoreId);
        if (!scoreIdentity)
            return 0;
        const objective = world.scoreboard.getObjective("MonsterKills");
        if (!objective)
            return 0;
        const score = objective.getScore(scoreIdentity);
        if (!score)
            return 0;
        return score;
    }
    ScoreCounts.getMonsterKills = getMonsterKills;
    function getMobKills(playerId) {
        const scoreId = getScoreId(playerId);
        const scoreIdentity = world.scoreboard.getParticipants().find((v) => v.id === scoreId);
        if (!scoreIdentity)
            return 0;
        const objective = world.scoreboard.getObjective("MobKills");
        if (!objective)
            return 0;
        const score = objective.getScore(scoreIdentity);
        if (!score)
            return 0;
        return score;
    }
    ScoreCounts.getMobKills = getMobKills;
    function addPlayerDeath(player) {
        const objective = world.scoreboard.getObjective("PlayerDeath");
        if (!objective) {
            world.scoreboard.addObjective("PlayerDeath");
            addPlayerDeath(player);
            return;
        }
        objective.addScore(player, 1);
    }
    ScoreCounts.addPlayerDeath = addPlayerDeath;
    function addPlayerKills(player) {
        const objective = world.scoreboard.getObjective("PlayerKills");
        if (!objective) {
            world.scoreboard.addObjective("PlayerKills");
            addPlayerDeath(player);
            return;
        }
        objective.addScore(player, 1);
    }
    ScoreCounts.addPlayerKills = addPlayerKills;
    function addMonsterKills(player) {
        const objective = world.scoreboard.getObjective("MonsterKills");
        if (!objective) {
            world.scoreboard.addObjective("MonsterKills");
            addPlayerDeath(player);
            return;
        }
        objective.addScore(player, 1);
    }
    ScoreCounts.addMonsterKills = addMonsterKills;
    function addMobKills(player) {
        const objective = world.scoreboard.getObjective("MobKills");
        if (!objective) {
            world.scoreboard.addObjective("MobKills");
            addPlayerDeath(player);
            return;
        }
        objective.addScore(player, 1);
    }
    ScoreCounts.addMobKills = addMobKills;
    function setPlayer(player) {
        var _a;
        const scoreId = (_a = player.scoreboardIdentity) === null || _a === void 0 ? void 0 : _a.id;
        if (scoreId) {
            let scoreIds = {};
            const data = Database.get("candra:scoreids");
            if (typeof data === "object")
                scoreIds = data;
            scoreIds[player.id] = scoreId;
            Database.set("candra:scoreids", scoreIds);
            return;
        }
        for (const objective of world.scoreboard.getObjectives()) {
            if (!objective.hasParticipant(player)) {
                objective.setScore(player, 0);
                setPlayer(player);
            }
        }
    }
    ScoreCounts.setPlayer = setPlayer;
})(ScoreCounts || (ScoreCounts = {}));
world.afterEvents.playerSpawn.subscribe((ev) => {
    system.run(() => {
        ScoreCounts.setPlayer(ev.player);
    });
});
world.afterEvents.worldInitialize.subscribe(() => {
    if (!world.scoreboard.getObjective("PlayerKills")) {
        world.scoreboard.addObjective("PlayerKills");
    }
    if (!world.scoreboard.getObjective("MobKills")) {
        world.scoreboard.addObjective("MobKills");
    }
    if (!world.scoreboard.getObjective("MonsterKills")) {
        world.scoreboard.addObjective("MonsterKills");
    }
    if (!world.scoreboard.getObjective("PlayerDeath")) {
        world.scoreboard.addObjective("PlayerDeath");
    }
});
world.afterEvents.entityDie.subscribe((ev) => {
    var _a;
    if (ev.deadEntity.typeId === "minecraft:player") {
        system.run(() => {
            const playerDie = ev.deadEntity;
            ScoreCounts.addPlayerDeath(playerDie);
        });
    }
    if (((_a = ev.damageSource.damagingEntity) === null || _a === void 0 ? void 0 : _a.typeId) === "minecraft:player") {
        system.run(() => {
            const deadEntity = ev.deadEntity;
            const source = ev.damageSource.damagingEntity;
            if (deadEntity.typeId === "minecraft:player")
                ScoreCounts.addPlayerKills(source);
            if (!deadEntity.matches({ excludeFamilies: ["monster"] }))
                ScoreCounts.addMonsterKills(source);
            if (!deadEntity.matches({ excludeFamilies: ["mob"] }))
                ScoreCounts.addMobKills(source);
        });
    }
});
