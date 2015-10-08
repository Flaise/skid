import {toRadians, toVector} from './turns'

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
            return this.sum(toVector(other))
    }
    sumXY(x, y) {
        return new Vec2(this.x + x, this.y + y)
    }
    
    distance4(other) {
        return distance4(this.x, this.y, other.x, other.y)
    }
    distance8(other) {
        return distance8(this.x, this.y, other.x, other.y)
    }
    
    rotatedTurns(angle) {
        return rotatedXYTurns(this.x, this.y, angle)
    }
    rotatedRadians(angle) {
        return rotatedXYRadians(this.x, this.y, angle)
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
export function distance8(x1, y1, x2, y2) {
    return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y))
}
export function rotatedXYTurns(x, y, angle) {
    return rotatedXYRadians(x, y, toRadians(angle))
}
export function rotatedXYRadians(x, y, angle) {
    const s = Math.sin(angle)
    const c = Math.cos(angle)
    return new Vec2(x * c - y * s, x * s + y * c)
}
