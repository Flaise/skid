const handlers = Object.create(null);

function identity(a) {
    // yay, micro-optimization
    return a;
}

export function addHandler(code, handler) {
    if (typeof handler !== 'function') throw new Error('handler must be a function');

    let keys = code;
    if (typeof code === 'string') {
        keys = code.split(' ').filter(identity);
    }

    for (const key of keys) {
        if (key === null || key === 'null' || key === undefined || key === 'undefined') {
            throw new Error('code must be defined');
        }
        const prev = handlers[key];
        if (prev) {
            handlers[key].push(handler);
        } else {
            handlers[key] = [handler];
        }
    }
}

export function handle(state, code, arg) {
    if (!state) throw new Error();
    if (typeof state !== 'object') throw new Error('state must be an object');
    if (state.debug) console.log(code, arg);
    const list = handlers[code];
    if (!list) return;
    for (const func of list) {
        func(state, arg);
    }
}

export function clearHandlers() {
    for (const key in handlers) {
        delete handlers[key];
    }
}
