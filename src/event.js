import {inspect} from 'util';

const handlers = Object.create(null);

function identity(a) {
    return a;
}

let warned = false;

export function addHandler(code, handler) {
    if (typeof handler !== 'function') throw new Error('handler must be a function');

    if (handling > 0 && !warned) {
        warned = true;
        console.warn('addHandler should only be called during program initialization, ' +
                     'not after events are triggered')
    }

    let keys;
    if (typeof code === 'string') {
        keys = code.split(' ').filter(identity);
    } else if (Array.isArray(code)) {
        keys = code;
    } else {
        keys = [code];
    }

    for (const key of keys) {
        if (key === null || key === 'null' || key === undefined || key === 'undefined') {
            throw new Error('code must be defined');
        }
        const prev = handlers[key];
        if (prev) {
            prev.push(handler);
        } else {
            handlers[key] = [handler];
        }
    }
}

const silences = [];
export function silence(code) {
    if (Array.isArray(code)) {
        silences.push(...code);
    } else {
        silences.push(code);
    }
}

let handling = 0;

export function handle(state, code, arg) {
    if (!state) throw new Error();
    if (typeof state !== 'object') throw new Error('state must be an object');
    if (state.skid.debug && silences.indexOf(code) < 0) {
        console.log('[event]', code, inspect(arg, {depth: 0}));
    }
    const list = handlers[code];
    if (!list) return;
    handling += 1;
    try {
        // for-of syntax gives bad tracebacks
        for (let i = 0; i < list.length; i += 1) {
            const func = list[i];
            func(state, arg);
        }
    }
    finally {
        handling -= 1;
    }
}
