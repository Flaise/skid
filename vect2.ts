'use strict'


class Vect2 {
    constructor(public x:number, public y:number) {
    }
    equals(obj) {
        return obj && this.x === obj.x && this.y === obj.y
    }
    hashCode() {
        return (this.x << 8) | this.y
    }
    
    sum(other) {
        if(isNaN(other))
            return this.sumi(other.x, other.y)
        else
            return this.sum(turns.toVector(other))
    }
    sumi(x, y) {
        return new Vect2(this.x + x, this.y + y)
    }
    
    distance4(other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y)
    }
    
    rotated(angle) {
        var rad = turns.toRadians(angle)
        var sin = Math.sin(rad)
        var cos = Math.cos(rad)
        return new Vect2(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
    }
    toString() {
        return this.x + ',' + this.y
    }
    
    static get ZERO() {
        return new Vect2(0, 0)
    }
    
    get inverse() {
        return new Vect2(-this.x, -this.y)
    }
}
module.exports = exports = Vect2

var turns = require('./turns') // must be after exports because of circular import
