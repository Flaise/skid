'use strict'

var turns = require('./turns')


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
        if(!isNaN(other)) // assume a number is an angle
            return this.sum(Vect2.fromAngle(other))
        else
            return this.sumi(other.x, other.y)
    }
    sumi(x, y) {
        return new Vect2(this.x + x, this.y + y)
    }
    
    distance4(other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y)
    }
    
    rotation(angle) {
        var rad = turns.toRadians(angle)
        var sin = Math.sin(rad)
        var cos = Math.cos(rad)
        return new Vect2(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
    }
    toString() {
        return this.x + ',' + this.y
    }
    
    static fromAngle(angle) {
        switch(turns.wrap(angle)) {
            case Vect2.NORTH: return new Vect2(0, -1)
            case Vect2.EAST: return new Vect2(1, 0)
            case Vect2.SOUTH: return new Vect2(0, 1)
            case Vect2.WEST: return new Vect2(-1, 0)
            default: return new Vect2(0, 0)
        }
    }
    static NORTH = 0
    static EAST = .25
    static SOUTH = .5
    static WEST = .75
    
    static get ZERO() {
        return new Vect2(0, 0)
    }
    
    get inverse() {
        return new Vect2(-this.x, -this.y)
    }
}
export = Vect2
