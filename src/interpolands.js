import ObjectPool from './object-pool'
import is from './is'

class Interpoland {
    constructor(tweens, value) {
        value = value || 0
        this.curr = value
        this.base = value
        this.dest = value
        this.tweens = tweens
        this.removed = false
    }
    
    mod(delta, duration, tweenFunc, onDone, remainder) {
        if(!delta && !onDone)
            return
        this.dest += delta
        return this.tweens.make(this, delta, delta, duration, tweenFunc, onDone, remainder)
    }
    modTo(dest, duration, tweenFunc, onDone, remainder) {
        return this.mod(dest - this.dest, duration, tweenFunc, onDone, remainder)
    }
    modNow(delta) {
        this.base += delta
        this.curr += delta
        this.dest += delta
    }
    modToNow(dest) {
        this.modNow(dest - this.dest)
    }
    setTo(dest) {
        // TODO: compare this.dest and current number of tweens attached to this interpoland
        // for early-out
        this.base = dest
        this.curr = dest
        this.dest = dest
        this.tweens.removeInterpolands([this]) // TODO
        this.tweens.changed() // TODO: without early-out, this is getting called every frame
    }
    setToInitial(dest) {
        this.base = dest
        this.curr = dest
        this.dest = dest
    }
    mod_noDelta(amplitude, duration, tweenFunc, onDone, remainder) {
        return this.tweens.make(this, 0, amplitude, duration, tweenFunc, onDone, remainder)
    }
    remove() {
        this.removed = true
    }
}

export default class Interpolands {
    constructor(avatar) {
        this.pool = new ObjectPool(Interpoland)
        this.tweens = new Tweens(avatar)
    }
    make(value) {
        return this.pool.make(this.tweens, value)
    }
    update(dt) {
        var shiftBy = 0
        for(var i = 0; i < this.pool.aliveCount; i += 1) {
            var interpoland = this.pool.alive[i]
            
            if(interpoland.removed) {
                this.pool.dead[this.pool.deadCount] = interpoland
                this.pool.deadCount += 1
                shiftBy += 1
            }
            else {
                if(shiftBy && i - shiftBy >= 0)
                    this.pool.alive[i - shiftBy] = interpoland
                interpoland.curr = interpoland.base
            }
        }
        this.pool.aliveCount -= shiftBy
        this.tweens.update(dt)
    }
    clear() {
        this.pool.clear()
        this.tweens.clear()
    }
}


function Tween(interpoland, dest, amplitude, duration, func, onDone, remainder) {
    this.interpoland = interpoland
    this.curr = 0
    this.elapsed = remainder
    this.dest = dest
    this.duration = duration
    this.func = func
    this.onDone = onDone
    this.amplitude = amplitude
}


class Tweens extends ObjectPool {
    constructor(avatar) {
        super(Tween)
        this.ending = []
        this.remainder = 0
        this.avatar = avatar
    }
    
    make(interpoland, dest, amplitude, duration, func, onDone, remainder) {
        if(is.nullish(remainder))
            remainder = this.remainder
        const result = super.make(interpoland, dest, amplitude, duration, func, onDone, remainder)
        this.changed()
        return result
    }
    
    changed() {
        this.avatar.changed()
    }
    
    removeInterpolands(removals, count) {
        if(count === 0)
            return
        count = count || removals.length
        // sanity(count <= removals.length)
        
        var shiftBy = 0
        for(var i = 0; i < this.aliveCount; i += 1) {
            var tween = this.alive[i]
            
            var deleting = false
            for(var j = 0; j < count; j += 1) {
                if(removals[j] === tween.interpoland) {
                    deleting = true
                    break
                }
            }
            
            if(deleting) {
                this.dead[this.deadCount] = tween
                this.deadCount += 1
                shiftBy += 1
            }
            else if(shiftBy && i - shiftBy >= 0)
                this.alive[i - shiftBy] = tween
        }
        this.aliveCount -= shiftBy
    }
    
    update(dt) {
        var endingCount = 0
        var shiftBy = 0
        for(var i = 0; i < this.aliveCount; i += 1) {
            var tween = this.alive[i]
            tween.elapsed += dt
            
            if(tween.interpoland.removed) {
                shiftBy += 1
                
                this.dead[this.deadCount] = tween
                this.deadCount += 1
            }
            else if(tween.elapsed >= tween.duration) {
                shiftBy += 1
                
                if(tween.onDone) {
                    this.ending[endingCount] = tween
                    endingCount += 1
                }
                else {
                    this.dead[this.deadCount] = tween
                    this.deadCount += 1
                }
                
                tween.interpoland.curr += tween.dest
                tween.interpoland.base += tween.dest
            }
            else {
                tween.interpoland.curr += tween.amplitude * tween.func(tween.elapsed / tween.duration)

                if(shiftBy && i - shiftBy >= 0)
                    this.alive[i - shiftBy] = tween
            }
        }
        this.aliveCount -= shiftBy
        for(var i = 0; i < endingCount; i += 1) {
            var tween = this.ending[i]
            
            this.remainder = tween.elapsed - tween.duration
            tween.onDone(this.remainder)
            tween.onDone = undefined
            this.dead[this.deadCount] = tween
            this.deadCount += 1
        }
        this.remainder = 0
        
        if(this.aliveCount)
            this.changed()
    }
}
