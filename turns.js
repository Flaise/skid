'use strict'


exports.wrap = function(a) {
    var b = a - Math.ceil(a)
    return b && b + 1
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
