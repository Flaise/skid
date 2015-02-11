'use strict'

var funcs = {}

funcs.number = function(a) {
    return (typeof a === 'number') && a !== Infinity && !isNaN(a)
}

funcs.defined = function(a) {
    return a != null
}

funcs.nullish = function(a) {
    return a == null
}

funcs.integer = function(a) {
    return a === Math.floor(a)
}

funcs.boolean = function(a) {
    return !!a === a
}

funcs.func = function(a) {
    return typeof a === 'function'
}

funcs.object = function(a) {
    return !!a && typeof a === 'object'
}

function composeOr(r, s) {
    return addCompositorsTo(function(a) {
        return r(a) || s(a)
    })
}

function makeCompositions(func, compositor) {
    var result = {}
    for(var key in funcs)
        (function(key) {
            Object.defineProperty(result, key, {get: function() {
                return compositor(func, funcs[key])
            }})
        })(key)
    return result
}

function addCompositorsTo(func) {
    func.or = makeCompositions(func, composeOr)
    return func
}
for(var key in funcs)
    addCompositorsTo(funcs[key])

module.exports = funcs
