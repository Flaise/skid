export default class ObjectPool {
    constructor(make) {
        this.constructor = make
        this.alive = []
        this.dead = []
        this.aliveCount = 0
        this.deadCount = 0
        // this._iterating = false // TODO: sanity checks
    }
    
    make(...args) {
        // sanity(!this._iterating) // TODO
        if(this.deadCount) {
            this.deadCount -= 1
            var obj = this.dead[this.deadCount]
            // sanity(!obj._doNotDelete)
            this.constructor.call(obj, ...args)
            // if(sanity.throws)
                // this.dead[this.deadCount] = undefined
        }
        else {
            var obj = Object.create(this.constructor.prototype)
            this.constructor.call(obj, ...args)
        }
        
        this.alive[this.aliveCount] = obj
        this.aliveCount += 1
        return obj
    }
    
    clear() {
        // sanity(!this._iterating)
        var initialCount = this.aliveCount
        for(var i = 0; i < initialCount; i += 1) {
            var obj = this.alive[i]
            this.dead[this.deadCount] = obj
            this.deadCount += 1
        }
        this.aliveCount = 0
    }
    
    remove(removals) {
        // sanity(!this._iterating)
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
        // sanity(shiftBy === removals.length)
    }
    
    removeAt(index) {
        // sanity(!this.alive[index]._doNotDelete)
        // sanity(!this._iterating)
        this.dead[this.deadCount] = this.alive[index]
        this.deadCount += 1
        
        var initialCount = this.aliveCount
        for(var i = index + 1; i < initialCount; i += 1) {
            var obj = this.alive[i]
            this.alive[i - 1] = obj
        }
        this.aliveCount -= 1
    }
}
