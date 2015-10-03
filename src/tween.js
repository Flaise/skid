export function zero(x) { return 0 }
export function one(x) { return 1 }
export function linear(x) { return x }
export function power_fac(exp) {
    if(exp === 1)
        return linear
    return (x) => Math.pow(x, exp)
}
export function quadratic(x) { return x * x }
export function cubic(x) { return x * x * x }
export function quartic(x) { return x * x * x * x }

export function sine(x) { return Math.sin(x * Math.PI / 2) }
export function sine_2(x) { return sine(sine(x)) }
export function sine_3(x) { return sine(sine(sine(x))) }
export function cosine(x) { return (1 - Math.cos(x * Math.PI)) / 2 }
export function circle(x) { return Math.sqrt(1 - Math.pow(x - 1, 2)) }
export function reverseSine(x) { return 1 - Math.sin((x + 1) * Math.PI / 2) }

export function noDelta_sine_fac(cycles) {
    if(arguments.length !== 1) // TODO
        throw new Error()
    if(isNaN(cycles))
        throw new Error()
    if(Math.floor(cycles * 2) !== cycles * 2)
        throw new Error('number of cycles must be multiple of .5')
    return (x) => Math.sin(x * Math.PI * 2 * cycles)
}

export function noDelta_quake_fac(cycles) {
    const subFunc = noDelta_sine_fac(cycles)
    return (x) => (1 - x) * subFunc(x)
}
