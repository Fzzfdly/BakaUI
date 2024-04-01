import { world } from "@minecraft/server";
/**Candra Database for Minecraft World */
export var Database;
(function (Database) {
    function set(name, data) {
        if (data === undefined || data === null)
            return world.setDynamicProperty(name);
        world.setDynamicProperty(name, JSON.stringify(data));
    }
    Database.set = set;
    function get(name) {
        const data = world.getDynamicProperty(name);
        if (typeof data !== "string")
            return undefined;
        return JSON.parse(data);
    }
    Database.get = get;
    function has(name) {
        const data = world.getDynamicProperty(name);
        if (data === undefined)
            return false;
        else
            return true;
    }
    Database.has = has;
    function forEach(callback) {
        enteries().forEach((v, i, arr) => {
            callback(v[0], v[1], i, arr);
        });
    }
    Database.forEach = forEach;
    function keys() {
        return world.getDynamicPropertyIds();
    }
    Database.keys = keys;
    function values() {
        let _values = [];
        world.getDynamicPropertyIds().forEach((v) => {
            const data = world.getDynamicProperty(v);
            if (data === undefined) {
                _values.push(undefined);
                return;
            }
            const jsonData = JSON.parse(data.toString());
            _values.push(jsonData);
        });
        return _values;
    }
    Database.values = values;
    function enteries() {
        return world.getDynamicPropertyIds().map((v) => {
            const data = world.getDynamicProperty(v);
            if (data === undefined)
                return [v, undefined];
            const jsonData = JSON.parse(data.toString());
            return [v, jsonData];
        });
    }
    Database.enteries = enteries;
    function size() {
        return world.getDynamicPropertyIds().length;
    }
    Database.size = size;
})(Database || (Database = {}));
