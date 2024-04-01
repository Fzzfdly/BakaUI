export var DimensionId;
(function (DimensionId) {
    DimensionId["Overworld"] = "minecraft:overworld";
    DimensionId["Nether"] = "minecraft:nether";
    DimensionId["TheEnd"] = "minecraft:the_end";
})(DimensionId || (DimensionId = {}));
export function CenterPos(pos) {
    let x = Math.floor(pos.x) + 0.5;
    let y = Math.floor(pos.y) + 0.5;
    let z = Math.floor(pos.z) + 0.5;
    return { x, y, z };
}
export class Vec3 {
    static create(a, b, c) {
        let v = Vec3.create(0, 0, 0);
        if (typeof a === "number") {
            v.x = a;
            v.y = b;
            v.z = c;
        }
        else {
            v.x = a.x;
            v.y = a.y;
            v.z = a.z;
        }
        return v;
    }
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(pos) {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
    }
    distance(pos) {
        return Math.sqrt(this.distanceSq(pos));
    }
    distanceSq(pos) {
        const xdist = this.x - pos.x;
        const ydist = this.y - pos.y;
        const zdist = this.z - pos.z;
        return xdist * xdist + ydist * ydist + zdist * zdist;
    }
    equal(pos) {
        return this.x === pos.x && this.y === pos.y && this.z === pos.z;
    }
    floor() {
        return Vec3.create(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
    }
    ceil() {
        return Vec3.create(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
    }
    round() {
        return Vec3.create(Math.round(this.x), Math.round(this.y), Math.round(this.z));
    }
    abs() {
        return Vec3.create(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }
    inc(a, b = 0, c = 0) {
        if (typeof a === "number") {
            return Vec3.create(this.x + a, this.y + b, this.z + c);
        }
        else {
            return this.inc(a.x, a.y, a.z);
        }
    }
    dec(a, b = 0, c = 0) {
        if (typeof a === "number") {
            return this.inc(-a, -b, -c);
        }
        else {
            return this.inc(-a.x, -a.y, -a.z);
        }
    }
    multiply(times) {
        return Vec3.create(this.x * times, this.y * times, this.z * times);
    }
    divide(times) {
        return Vec3.create(this.x / times, this.y / times, this.z / times);
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    normalize() {
        const len = this.lengthSquared();
        if (len > 0) {
            return this.divide(Math.sqrt(len));
        }
        return Vec3.create(0, 0, 0);
    }
}
export class LandPosXZ {
    constructor(x, z) {
        this.x = x;
        this.z = z;
    }
    static create(pos) {
        let x = Math.floor(pos.x);
        let z = Math.floor(pos.z);
        return new LandPosXZ(x, z);
    }
    setPos(pos) {
        let x = Math.floor(pos.x);
        let z = Math.floor(pos.z);
        this.x = x;
        this.z = z;
    }
    setX(x) {
        this.x = Math.floor(x);
    }
    setZ(z) {
        this.z = Math.floor(z);
    }
    getX() {
        return Math.floor(this.x);
    }
    getZ() {
        return Math.floor(this.z);
    }
    toJSON() {
        return {
            x: this.getX(),
            z: this.getZ(),
        };
    }
    toString() {
        return `[${this.x}, ${this.z}]`;
    }
}
export class LandPos {
    constructor(pos1, pos2, dimension) {
        this.pos1 = pos1;
        this.pos2 = pos2;
        this.dimension = dimension;
        if (pos2.x > pos1.x) {
            const old = pos2.x;
            pos2.x = pos1.x;
            pos1.x = old;
        }
        if (pos2.z > pos1.z) {
            const old = pos2.z;
            pos2.z = pos1.z;
            pos1.z = old;
        }
    }
    static create(pos1, pos2, dimensionId) {
        return new LandPos(LandPosXZ.create(pos1), LandPosXZ.create(pos2), dimensionId);
    }
    setPos1(pos) {
        this.pos1 = LandPosXZ.create(pos);
    }
    setPos2(pos) {
        this.pos2 = LandPosXZ.create(pos);
    }
    setDimensionId(dimensionId) {
        this.dimension = dimensionId;
    }
    getPos1() {
        return this.pos1;
    }
    getPos2() {
        return this.pos2;
    }
    getDimensionId() {
        return this.dimension;
    }
    getSize() {
        let calculate = Math.abs(this.pos2.x - this.pos1.x) * Math.abs(this.pos2.z - this.pos1.z);
        return calculate;
    }
    toJSON() {
        return {
            pos1: this.pos1.toJSON(),
            pos2: this.pos2.toJSON(),
            dimension: this.dimension,
        };
    }
    toString() {
        return `[ ${this.pos1.toString()} ${this.pos2.toString()}: ${this.dimension} ]`;
    }
}
