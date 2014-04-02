'use strict'

if(typeof require !== 'undefined') {
    var EventDispatcher = require('./eventdispatcher')
}

function Reactant(value) {
    EventDispatcher.call(this)
    this.value = value
    this.breakHierarchy = undefined
}
Reactant.prototype = {
    __proto__: EventDispatcher.prototype,
    setFunc: function(func, onMod) {
        var removal = this.setFuncSilent(func, onMod)
        this.proc()
        return removal
    },
    super_proc: EventDispatcher.prototype.proc,
    proc: function() {
        var prev = this.lastValue
        var curr = this.value
        if(this.equality(prev, curr)) return

        this.lastValue = curr // must be saved here because it might be altered during event propagation
        this.super_proc(prev, curr)
    },
    listen_pc: function(callback) {
        var result = this.listen(callback)  /// TODO: test for removal called during first call of callback
        callback(undefined, this.value)
        return result
    },
    and: function(other) {
        return this.compose(other, function(a, b) { return a && b })
    },
    or: function(other) {
        return this.compose(other, function(a, b) { return a || b })
    },
    transform: function(func) {
        var result = new Reactant()
        result.setFunc(function() { return func(this.value) }.bind(this))

        ////////////////////////////////////////////////////// TODO: This listener needs to be removed when `result` has none of its own listeners, and re-added when it does
        //var remove = this.listen(function() { result.proc() })
        var remove = this.listen(result.proc.bind(result))

        return result
    },
    onCondition: function(predicate) {
        return this.transform(predicate).on(true)
    },
    on: function(target) {
        var result = new EventDispatcher()

        ////////////////////////////////////////////////////// TODO: This listener needs to be removed when `result` has none of its own listeners, and re-added when it does
        this.listen(function(prev, curr) {
            if(this.equality(curr, target))
                result.proc()
        }.bind(this))
        return result
    },
    onNot: function(target) {
        var result = new EventDispatcher()

        ////////////////////////////////////////////////////// TODO: This listener needs to be removed when `result` has none of its own listeners, and re-added when it does
        this.listen(function(prev, curr) {
            if(!this.equality(curr, target))
                result.proc()
        }.bind(this))
        return result
    },
    /////////////////////////////////////////////// TODO: reactant.filter

    setFuncSilent: function(func, onMod) {
        if(this.breakHierarchy) this.breakHierarchy()
        this.breakHierarchy = undefined

        this.valueFunc = func

        if(onMod)
            this.breakHierarchy = onMod.listen(this.proc.bind(this))
        return this.breakHierarchy
    },
    compose: function(b, func) {
        var a = this
        var result = new Reactant()
        result.setFunc(function() {
            return func(a.value, b.value)
        })

        ////////////////////////////////////////////////////// TODO: These listeners need to be removed when `result` has none of its own listeners, and re-added when it does
        var removeA = a.listen(result.proc.bind(result))
        var removeB = b.listen(result.proc.bind(result))

        return result
    },
    assignment: function(value) {
        this.setFunc(function() { return value })
    },
    equality: function(a, b) {
        if(a === b)
            return true
        if(a && a.equals)
            return a.equals(b)
        if(b && b.equals)
            return b.equals(a)
        return false
    },
    depend: function(transformation, reactant) {
        this.setFunc(function() {
            return transformation(reactant.value)
        }, reactant)
    },
    echo: function(reactant) {
        this.setFunc(function() {
            return reactant.value
        }, reactant)
    }
}
Object.defineProperties(
    Reactant.prototype, {
        value: {
            get: function() {
                if(this.valueFunc) return this.valueFunc()
                return undefined
            },
            set: function(value) {
                this.assignment(value)
            }
        },
        not: {
            get: function() { return this.transform(function(a) { return !a }) }
        },
        negative: {
            get: function() { return this.transform(function(a) { return -a }) }
        },
        anyTruthy: {
            get: function() {
                var result = new EventDispatcher()

                this.listen(function(prev, curr) {
                    if(curr)
                        result.proc()
                })
                return result
            }
        },
        anyFalsy: {
            get: function() {
                // TODO: EventDispatcher.transform
                var result = new EventDispatcher()

                this.listen(function(prev, curr) {
                    if(!curr)
                        result.proc()
                })
                return result
            }
        }
    }
)

if(typeof module !== 'undefined') {
    module.exports = Reactant
}
