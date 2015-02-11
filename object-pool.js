'use strict'

var sanity = require('./sanity')


function ObjectPool(constructor) {
    this.constructor = constructor
    this.alive = []
    this.dead = []
    this.aliveCount = 0
    this.deadCount = 0
    this._iterating = false
}
module.exports = exports = ObjectPool

ObjectPool.prototype.make = function(/*varargs*/) {
    sanity(!this._iterating)
    if(this.deadCount) {
        if(sanity.throws) {
            for(var i = 0; i < this.aliveCount; i += 1) {
                sanity(this.dead[this.deadCount - 1] !== this.alive[i])
            }
        }
        this.deadCount -= 1
        var obj = this.dead[this.deadCount]
        sanity(!obj._doNotDelete)
        this.constructor.apply(obj, arguments)
        if(sanity.throws)
            this.dead[this.deadCount] = undefined
    }
    else {
        var obj = Object.create(this.constructor.prototype)
        this.constructor.apply(obj, arguments)
    }
    
    this.alive[this.aliveCount] = obj
    this.aliveCount += 1
    return obj
}
ObjectPool.prototype.clear = function() {
    sanity(!this._iterating)
    var initialCount = this.aliveCount
    for(var i = 0; i < initialCount; i += 1) {
        var obj = this.alive[i]
        if(sanity.throws && obj._doNotDelete)
            continue ////////////////////////////////////// TODO
        this.dead[this.deadCount] = obj
        this.deadCount += 1
    }
    this.aliveCount = 0
}
ObjectPool.prototype.remove = function(removals) {
    if(sanity.throws)
        for(var i = 0; i < removals.length; i += 1)
            sanity(!removals[i]._doNotDelete)
    sanity(!this._iterating)
    var shiftBy = 0
    var initialCount = this.aliveCount
    for(var i = 0; i < initialCount; i += 1) {
        var obj = this.alive[i]
        
        var deleting = false
        if(shiftBy < removals.length)
            for(var j = 0; j < removals.length; j += 1) {
                if(removals[j] === obj) {
                    deleting = true
                    break
                }
            }

        if(deleting) {
            this.dead[this.deadCount] = obj
            this.deadCount += 1
            shiftBy += 1
        }
        else if(shiftBy && i - shiftBy >= 0)
            this.alive[i - shiftBy] = obj
    }
    this.aliveCount -= shiftBy
    sanity(shiftBy === removals.length)
}
ObjectPool.prototype.removeAt = function(index) {
    sanity(!this.alive[index]._doNotDelete)
    sanity(!this._iterating)
    this.dead[this.deadCount] = this.alive[index]
    this.deadCount += 1
    
    var initialCount = this.aliveCount
    for(var i = index + 1; i < initialCount; i += 1) {
        var obj = this.alive[i]
        this.alive[i - 1] = obj
    }
    this.aliveCount -= 1
}
