'use strict';
var turns = require('./turns');

var Vect2 = (function () {
    function Vect2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vect2.prototype.equals = function (obj) {
        return obj && this.x === obj.x && this.y === obj.y;
    };
    Vect2.prototype.hashCode = function () {
        return (this.x << 8) | this.y;
    };

    Vect2.prototype.sum = function (other) {
        if (!isNaN(other))
            return this.sum(Vect2.fromAngle(other));
        else
            return this.sumi(other.x, other.y);
    };
    Vect2.prototype.sumi = function (x, y) {
        return new Vect2(this.x + x, this.y + y);
    };

    Vect2.prototype.distance4 = function (other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    };

    Vect2.prototype.rotation = function (angle) {
        var rad = turns.toRadians(angle);
        var sin = Math.sin(rad);
        var cos = Math.cos(rad);
        return new Vect2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    };
    Vect2.prototype.toString = function () {
        return this.x + ',' + this.y;
    };

    Vect2.fromAngle = function (angle) {
        switch (turns.wrap(angle)) {
            case Vect2.NORTH:
                return new Vect2(0, -1);
            case Vect2.EAST:
                return new Vect2(1, 0);
            case Vect2.SOUTH:
                return new Vect2(0, 1);
            case Vect2.WEST:
                return new Vect2(-1, 0);
            default:
                return new Vect2(0, 0);
        }
    };

    Object.defineProperty(Vect2, "ZERO", {
        get: function () {
            return new Vect2(0, 0);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Vect2.prototype, "inverse", {
        get: function () {
            return new Vect2(-this.x, -this.y);
        },
        enumerable: true,
        configurable: true
    });
    Vect2.NORTH = 0;
    Vect2.EAST = .25;
    Vect2.SOUTH = .5;
    Vect2.WEST = .75;
    return Vect2;
})();
module.exports = Vect2;
