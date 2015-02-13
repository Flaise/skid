'use strict'

/*
Usage:

if(sanity(a)) {
    ...; // a kludge that will keep the program from crashing
}
...; // the code that always executes
 */
module.exports = exports = function(arg) {
    arg = !arg
    if(exports.throws) {
        if(arg)
            throw new Error()
    }
    return arg
}

/*
 * If true, sanity(false) throws
 * If false, sanity(false) returns true
 */
exports.throws = false

exports.attribute = function(obj, key, value, validator) {
    if(exports.throws) {
        if(!validator)
            throw new Error()
        Object.defineProperty(obj, key, {
            get: function() { return value },
            set: function(newValue) {
                if(!validator(newValue))
                    throw new Error()
                value = newValue
            }
        })
    }
    else {
        obj[key] = value
    }
}
exports.attributes = function(obj, values, validator) {
    if(exports.throws) {
        if(typeof values === 'string'
                || !validator)
            throw new Error()
        for(var key in values)
            exports.attribute(obj, key, values[key], validator)
    }
    else {
        if(typeof initialValues === 'string')
            exports.attribute.apply(undefined, arguments)
        else
            for(var key in values)
                obj[key] = values[key]
    }
}

exports.constants = function(obj, values) {
    if(exports.throws) {
        if(typeof initialValues === 'string')
            throw new Error()
        for(var key in values)
            Object.defineProperty(obj, key, {value: values[key], writable: false})
    }
    else {
        if(typeof values === 'string')
            exports.constant.apply(undefined, arguments)
        else
            for(var key in values)
                obj[key] = values[key]
    }
}
exports.constant = function(obj, key, value) {
    if(exports.throws)
        Object.defineProperty(obj, key, {value: value, writable: false})
    else
        obj[key] = value
}

function raise() {
    throw new Error()
}

exports.noAccess = function(obj, keys) {
    if(!exports.throws)
        return
    if(!keys.forEach)
        return exports.noAccess(obj, [keys])
    keys.forEach(function(key) {
        Object.defineProperty(obj, key, {get: raise, set: raise})
    })
}

