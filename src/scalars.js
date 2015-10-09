
export function clamp(value, lo, hi) {
    if(lo > hi) return clamp(value, hi, lo)
    if(value < lo) return lo
    if(value > hi) return hi
    return value
}

export function randomInteger(lo, hi) {
    if(lo > hi) return randomInteger(hi, lo)
    if(lo !== Math.floor(lo)) throw new Error()
    if(hi !== Math.floor(hi)) throw new Error()
    return Math.floor(Math.random() * (hi - lo)) + lo
}

export function randomFloat(lo, hi) {
    if(lo > hi) return randomFloat(hi, lo)
    return Math.random() * (hi - lo) + lo
}

export function linearInterpolate(from, to, factor) {
    if(from > to) return linearInterpolate(to, from, 1 - factor)
    if(factor <= 0) return from
    if(factor >= 1) return to
    return from + (to - from) * factor
}

export function positiveModulus(r, s) {
    return ((r % s) + s) % s
}
