'use strict'


exports.zero = function(x) { return 0 }
exports.one = function(x) { return 1 }
exports.linear = function(x) { return x }
exports.power_fac = function(exp) {
    if(exp === 1)
        return exports.linear
    return function(v) { return Math.pow(v, exp) }
}
function sine(x) { return Math.sin(x * Math.PI / 2) }
exports.sine = sine
exports.sine_2 = function(x) { return sine(sine(x)) }
exports.sine_3 = function(x) { return sine(sine(sine(x))) }
exports.cosine = function(x) { return (1 - Math.cos(x * Math.PI)) / 2 }
exports.circle = function(x) { return Math.sqrt(1 - Math.pow(x - 1, 2)) }
exports.reverseSine = function(x) { return 1 - Math.sin((x + 1) * Math.PI / 2) }

exports.noDelta_sine_fac = function(cycles) {
    if(arguments.length !== 1) // TODO
        throw new Error()
    if(isNaN(cycles))
        throw new Error()
    if(Math.floor(cycles * 2) !== cycles * 2)
        throw new Error('number of cycles must be multiple of .5')
    return function(x) { return Math.sin(x * Math.PI * 2 * cycles) }
}

exports.noDelta_quake_fac = function(cycles) {
    if(arguments.length !== 1) // TODO
        throw new Error()
    var subFunc = exports.noDelta_sine_fac(cycles)
    return function(x) { return (1 - x) * subFunc(x) }
}

