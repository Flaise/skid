import {filter, remove} from './array'
import {handle, addHandler} from './event'

class Interpoland {
    mod(delta, duration, tweenFunc, onDone) {
        if(!delta && !onDone)
            return
        this.dest += delta
        return makeTween(this.state, this, delta, delta, duration, tweenFunc, onDone)
    }
    modTo(dest, duration, tweenFunc, onDone) {
        return this.mod(dest - this.dest, duration, tweenFunc, onDone)
    }
    modNow(delta) {
        this.base += delta
        this.curr += delta
        this.dest += delta
        if(this.tweenCount === 0)
            handle(this.state, 'request_draw')
    }
    modToNow(dest) {
        this.modNow(dest - this.dest)
    }
    setTo(dest) {
        if(arguments.length > 1)
            throw new Error('setTo() takes only 1 argument. Did you mean modTo()?');
        if(isNaN(dest))
            throw new Error()
        if(this.base === dest && this.tweenCount === 0)
            return
        this.base = dest
        this.curr = dest
        this.dest = dest
        if(this.tweenCount === 0)
            handle(this.state, 'request_draw')
        else
            removeTweensOf(this.state, this)
    }
    mod_noDelta(amplitude, duration, tweenFunc, onDone) {
        return makeTween(this.state, this, 0, amplitude, duration, tweenFunc, onDone)
    }
    remove() {
        removeInterpoland(this.state, this)
    }
}

function removeInterpoland(state, interpoland) {
    const interpolands = state.skid.interpolands
    remove(interpolands.interpolands, interpoland)
    removeTweensOf(state, interpoland)
    interpolands.interpolandsUnused.push(interpoland)
}

function removeTweensOf(state, interpoland) {
    if (interpoland.tweenCount === 0)
        return
    const interpolands = state.skid.interpolands
    filter(interpolands.tweens, (tween) => tween.interpoland !== interpoland)
    interpoland.tweenCount = 0
    handle(state, 'request_draw')
}

function makeTween(state, interpoland, magnitude, amplitude, duration, func, onDone) {
    const interpolands = state.skid.interpolands
    if(!func) throw new Error()
    if(isNaN(magnitude)) throw new Error()
    if(isNaN(amplitude)) throw new Error()
    if(isNaN(duration)) throw new Error()
    if(isNaN(interpolands.remainder)) throw new Error()
    const result = {
        interpoland, magnitude, amplitude, duration, func, onDone,
        curr: 0, elapsed: interpolands.remainder,
    }
    interpolands.tweens.push(result)
    interpoland.tweenCount += 1
    handle(state, 'request_draw')
    return result
}

export function makeInterpoland(state, value) {
    if (!state.skid.interpolands) {
        state.skid.interpolands = {
            tweens: [],
            tweensEnding: [],
            interpolands: [],
            interpolandsUnused: [],
            // TODO: merge with state.skid.timeRemainder; need to modify animationFrame
            remainder: 0,
        }
    }
    const interpolands = state.skid.interpolands
    let result
    if (interpolands.interpolandsUnused.length) {
        result = interpolands.interpolandsUnused.pop()
    } else {
        result = new Interpoland()
    }
    value = value || 0
    result.curr = value
    result.base = value
    result.dest = value
    result.state = state
    result.tweenCount = 0
    
    interpolands.interpolands.push(result)
    return result
}

function updateTween(tween, dt) {
    tween.elapsed += dt

    if(tween.elapsed >= tween.duration) {
        tween.interpoland.curr += tween.magnitude
        tween.interpoland.base += tween.magnitude
        tween.interpoland.tweenCount -= 1
        return false
    }

    tween.interpoland.curr += tween.amplitude *
                              tween.func.call(undefined, tween.elapsed / tween.duration)
    return true
}

addHandler('before_draw', (state, dt) => {
    const interpolands = state.skid.interpolands
    if (!interpolands) {
        return
    }

    for (let i = 0; i < interpolands.interpolands.length; i += 1) {
        interpolands.interpolands[i].curr = interpolands.interpolands[i].base
    }

    filter(interpolands.tweens, updateTween, interpolands.tweensEnding, dt)

    for(let i = 0; i < interpolands.tweensEnding.length; i += 1) {
        const tween = interpolands.tweensEnding[i]
        if (!tween.onDone) {
            continue;
        }
        interpolands.remainder = tween.elapsed - tween.duration
        tween.onDone.call()
    }
    interpolands.tweensEnding.length = 0
    interpolands.remainder = 0
})

addHandler('after_draw', (state) => {
    if (state.skid.interpolands && state.skid.interpolands.tweens.length) {
        handle(state, 'request_draw')
    }
})
