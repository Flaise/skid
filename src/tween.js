export function zero(x) { return Math.floor(x) }
export function one(x) { return Math.ceil(x) }
export function linear(x) { return x }
export function power_fac(exp) {
    if(exp === 1)
        return linear
    return (x) => Math.pow(x, exp)
}

export function quadratic(x) { return x * x }
export function quadraticInOut(x) {
    x *= 2
    if(x < 1)
        return x * x / 2
    x -= 1
    return -1 / 2 * (x * (x - 2) - 1)
}

export function cubic(x) { return x * x * x }
export function quartic(x) { return x * x * x * x }

export function sine(x) { return Math.sin(x * Math.PI / 2) }
export function sine_2(x) { return sine(sine(x)) }
export function sine_3(x) { return sine(sine(sine(x))) }
export function cosine(x) { return (1 - Math.cos(x * Math.PI)) / 2 }
export function circle(x) { return Math.sqrt(1 - Math.pow(x - 1, 2)) }
export function reverseSine(x) { return 1 - Math.sin((x + 1) * Math.PI / 2) }
