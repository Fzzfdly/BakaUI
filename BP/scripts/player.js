import { system, world } from "@minecraft/server";
import { Database } from "./utils/database";
export var PlayerName;
(function (PlayerName) {
    function getPlayers() {
        const data = Database.get("player:name");
        if (!data)
            return {};
        const players = JSON.parse(`${data}`);
        return players;
    }
    PlayerName.getPlayers = getPlayers;
    function getName(id) {
        if (!getPlayers().hasOwnProperty(id))
            return id;
        return getPlayers()[id];
    }
    PlayerName.getName = getName;
    function getPlayerId(name) {
        var _a;
        const id = (_a = Object.entries(getPlayers()).find(([playerId, playerName]) => playerName.toLowerCase() === name.toLowerCase())) === null || _a === void 0 ? void 0 : _a[0];
        if (!id)
            return null;
        return id;
    }
    PlayerName.getPlayerId = getPlayerId;
    function setPlayer(id, name) {
        let players = getPlayers();
        players[id] = name;
        Database.set("player:name", JSON.stringify(players));
    }
    PlayerName.setPlayer = setPlayer;
})(PlayerName || (PlayerName = {}));
world.afterEvents.playerJoin.subscribe((ev) => {
    system.run(() => {
        PlayerName.setPlayer(ev.playerId, ev.playerName);
    });
});
