import * as turns from './turns'


export default class Vec2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    equals(obj) {
        return obj && this.x === obj.x && this.y === obj.y
    }
    hashCode() {
        return (this.x << 8) | this.y
    }
    
    sum(other) {
        if(isNaN(other))
            return this.sumXY(other.x, other.y)
        else
            return this.sum(turns.toVector(other))
    }
    sumXY(x, y) {
        return new Vec2(this.x + x, this.y + y)
    }
    
    distance4(other) {
        return distance4(this.x, this.y, other.x, other.y)
    }
    
    rotated(angle) {
        const rad = turns.toRadians(angle)
        const sin = Math.sin(rad)
        const cos = Math.cos(rad)
        return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
    }
    toString() {
        return this.x + ',' + this.y
    }
    
    get inverse() {
        return new Vec2(-this.x, -this.y)
    }
}

export function ZERO() {
    return new Vec2(0, 0)
}
export function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}
export function distance4(x1, y1, x2, y2) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y)
}
