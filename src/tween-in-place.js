
export function sine_fac(cycles) {
    if(Math.floor(cycles * 2) !== cycles * 2)
        console.warn('number of cycles must be multiple of .5')
    return (x) => Math.sin(x * Math.PI * 2 * cycles)
}

export function quake_fac(cycles) {
    const subFunc = noDelta_sine_fac(cycles)
    return (x) => (1 - x) * subFunc(x)
}
