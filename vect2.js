'use strict';
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
        if (isNaN(other))
            return this.sumi(other.x, other.y);
        else
            return this.sum(turns.toVector(other));
    };
    Vect2.prototype.sumi = function (x, y) {
        return new Vect2(this.x + x, this.y + y);
    };

    Vect2.prototype.distance4 = function (other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    };

    Vect2.prototype.rotated = function (angle) {
        var rad = turns.toRadians(angle);
        var sin = Math.sin(rad);
        var cos = Math.cos(rad);
        return new Vect2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    };
    Vect2.prototype.toString = function () {
        return this.x + ',' + this.y;
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
    return Vect2;
})();
module.exports = exports = Vect2;

var turns = require('./turns');
