import {is} from './is'
import {filter, remove} from './array'

function Tween(interpoland, magnitude, amplitude, duration, func, onDone, remainder) {
    if(!func)
        throw new Error()
    this.interpoland = interpoland
    this.curr = 0
    this.elapsed = remainder
    this.magnitude = magnitude
    this.duration = duration
    this.func = func
    this.onDone = onDone
    this.amplitude = amplitude
}

class Interpoland {
    constructor(container, value) {
        value = value || 0
        this.curr = value
        this.base = value
        this.dest = value
        this.container = container
        this.tweenCount = 0
    }

    mod(delta, duration, tweenFunc, onDone, remainder) {
        if(!delta && !onDone)
            return
        this.dest += delta
        return this.container.makeTween(this, delta, delta, duration, tweenFunc, onDone, remainder)
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
        if(this.base === dest && this.tweenCount === 0)
            return
        this.base = dest
        this.curr = dest
        this.dest = dest
        if(this.tweenCount === 0)
            this.container.changed()
        else
            this.container.removeTweens(this)
    }
    mod_noDelta(amplitude, duration, tweenFunc, onDone, remainder) {
        return this.container.makeTween(this, 0, amplitude, duration, tweenFunc, onDone, remainder)
    }
    remove() {
        this.container.remove(this)
    }
}

export class Interpolands {
    constructor(avatar) {
        this.tweens = []
        this.ending = []
        this.interpolands = []
        this.remainder = 0
        this.avatar = avatar
    }

    make(value) {
        const result = new Interpoland(this, value)
        this.interpolands.push(result)
        return result
    }

    makeTween(interpoland, magnitude, amplitude, duration, func, onDone, remainder) {
        if(is.nullish(remainder))
            remainder = this.remainder
        const result = new Tween(interpoland, magnitude, amplitude, duration, func, onDone, remainder)
        this.tweens.push(result)
        this.changed()
        interpoland.tweenCount += 1
        return result
    }

    remove(interpoland) {
        remove(this.interpolands, interpoland)
        this.removeTweens(interpoland)
    }

    removeTweens(interpoland) {
        filter(this.tweens, (tween) => tween.interpoland !== interpoland)
        interpoland.tweenCount = 0
        this.changed()
    }

    update(dt) {
        for(let i = 0; i < this.interpolands.length; i += 1)
            this.interpolands[i].curr = this.interpolands[i].base

        filter(this.tweens, (tween) => {
            tween.elapsed += dt

            if(tween.elapsed >= tween.duration) {
                if(tween.onDone)
                    this.ending.push(tween)
                tween.interpoland.curr += tween.magnitude
                tween.interpoland.base += tween.magnitude
                tween.interpoland.tweenCount -= 1
                return false
            }

            tween.interpoland.curr += tween.amplitude *
                                      tween.func.call(undefined, tween.elapsed / tween.duration)
            return true
        })

        for(let i = 0; i < this.ending.length; i += 1) {
            const tween = this.ending[i]
            this.remainder = tween.elapsed - tween.duration
            tween.onDone.call(undefined, this.remainder)
        }
        this.ending.length = 0
        this.remainder = 0

        if(this.tweens.length)
            this.changed()
    }
    changed() {
        this.avatar.changed()
    }
}
