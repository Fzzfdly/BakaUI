export class EntityInventory {
    constructor(entity) {
        this.entity = entity;
        this.inventory = this.entity.getComponent("minecraft:inventory");
        this.equippable = this.entity.getComponent("minecraft:equippable");
        this.emptySlotsCount = this.container().emptySlotsCount;
        this.size = this.container().size;
        this.inventorySize = this.inventory.inventorySize;
    }
    container() {
        const container = this.inventory.container;
        if (!container)
            throw Error;
        return container;
    }
    addItem(item) {
        return this.container().addItem(item);
    }
    setItem(slot, item) {
        return this.container().setItem(slot, item);
    }
    getItem(slot) {
        return this.container().getItem(slot);
    }
    getItems() {
        let items = [];
        for (let i = 0; i < this.size; i++) {
            const item = this.getItem(i);
            if (item)
                items.push(item);
        }
        return items;
    }
    getContainerItems() {
        let items = [];
        for (let i = 0; i < this.size; i++) {
            const item = [this.getItem(i), i];
            items.push(item);
        }
        return items;
    }
    clear() {
        return this.container().clearAll();
    }
}
export class PlayerInventory extends EntityInventory {
}
