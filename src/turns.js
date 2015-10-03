'use strict'

var Vect2 = require('./vect2')


exports.wrap = function(a) {
    var b = a - Math.ceil(a)
    return b && (b + 1)
}
exports.toRadians = function(a) {
    return a * 2 * Math.PI
}
exports.fromRadians = function(a) {
    return a / 2 / Math.PI
}
exports.shortestOffset = function(from, to) {
    return exports.wrap(exports.wrap(to) - exports.wrap(from) + 1.5) - .5
}

var north = new Vect2(0, -1)
exports.toVector = function(a) {
    a = exports.wrap(a)
    switch(a) {
        case exports.NORTH: return new Vect2(0, -1)
        case exports.EAST: return new Vect2(1, 0)
        case exports.SOUTH: return new Vect2(0, 1)
        case exports.WEST: return new Vect2(-1, 0)
        default: return north.rotated(a)
    }
}
exports.NORTH = 0
exports.EAST = .25
exports.SOUTH = .5
exports.WEST = .75

