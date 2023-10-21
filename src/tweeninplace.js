export function sine(cycles) {
    if (Math.floor(cycles * 2) !== cycles * 2) {
        throw new Error('number of cycles must be multiple of .5');
    }
    return (x) => Math.sin(x * Math.PI * 2 * cycles);
}

export function quake(cycles) {
    const subFunc = sine(cycles);
    return (x) => (1 - x) * subFunc(x);
}
