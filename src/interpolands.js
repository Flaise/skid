import {is} from './is'
import {filter, remove} from './array'
import {handle, addHandler} from './event'

function Tween(interpoland, magnitude, amplitude, duration, func, onDone, remainder) {
    if(!func) throw new Error()
    if(isNaN(magnitude)) throw new Error()
    if(isNaN(amplitude)) throw new Error()
    if(isNaN(duration)) throw new Error()
    if(isNaN(remainder)) throw new Error()
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

    mod(delta, duration, tweenFunc, onDone) {
        if(!delta && !onDone)
            return
        this.dest += delta
        return this.container.makeTween(this, delta, delta, duration, tweenFunc, onDone)
    }
    modTo(dest, duration, tweenFunc, onDone) {
        return this.mod(dest - this.dest, duration, tweenFunc, onDone)
    }
    modNow(delta) {
        this.base += delta
        this.curr += delta
        this.dest += delta
        if(this.tweenCount === 0)
            handle(this.container.state, 'request_draw')
    }
    modToNow(dest) {
        this.modNow(dest - this.dest)
    }
    setTo(dest) {
        if(isNaN(dest))
            throw new Error()
        if(this.base === dest && this.tweenCount === 0)
            return
        this.base = dest
        this.curr = dest
        this.dest = dest
        if(this.tweenCount === 0)
            handle(this.container.state, 'request_draw')
        else
            this.container.removeTweens(this)
    }
    mod_noDelta(amplitude, duration, tweenFunc, onDone) {
        return this.container.makeTween(this, 0, amplitude, duration, tweenFunc, onDone)
    }
    remove() {
        this.container.remove(this)
    }
}

class Interpolands {
    constructor(state) {
        this.tweens = []
        this.ending = []
        this.interpolands = []

        // TODO: merge with state.skid.timeRemainder; need to modify animationFrame
        this.remainder = 0
        this.state = state
    }

    makeTween(interpoland, magnitude, amplitude, duration, func, onDone) {
        const result = new Tween(interpoland, magnitude, amplitude, duration, func, onDone,
                                 this.remainder)
        this.tweens.push(result)
        handle(this.state, 'request_draw')
        interpoland.tweenCount += 1
        return result
    }

    remove(interpoland) {
        remove(this.interpolands, interpoland)
        this.removeTweens(interpoland)
    }

    removeTweens(interpoland) {
        if (interpoland.tweenCount === 0)
            return
        filter(this.tweens, (tween) => tween.interpoland !== interpoland)
        interpoland.tweenCount = 0
        handle(this.state, 'request_draw')
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
            tween.onDone.call()
        }
        this.ending.length = 0
        this.remainder = 0
    }
}

export function makeInterpoland(state, value) {
    if (!state.skid.interpolands) {
        state.skid.interpolands = new Interpolands(state)
    }
    const group = state.skid.interpolands
    const result = new Interpoland(group, value)
    group.interpolands.push(result)
    return result
}

addHandler('before_draw', (state, dt) => {
    if (state.skid.interpolands) {
        state.skid.interpolands.update(dt)
    }
})

addHandler('after_draw', (state) => {
    if (state.skid.interpolands && state.skid.interpolands.tweens.length) {
        handle(state, 'request_draw')
    }
})
