import { isArray, isFunction, isHash, isString } from './is.js';

const handlers = Object.create(null);

function identity(a) {
    return a;
}

let warned = false;

export function addHandler(code, handler) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(handler)) {
            throw new Error('handler must be a function');
        }

        if (handling > 0 && !warned) {
            warned = true;
            console.warn('addHandler should only be called during program initialization, ' +
                         'not after events are triggered');
        }
    }

    let keys;
    if (isString(code)) {
        keys = code.split(' ').filter(identity);
    } else if (isArray(code)) {
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
    if (process.env.NODE_ENV !== 'production') {
        if (isArray(code)) {
            silences.push(...code);
        } else {
            silences.push(code);
        }
    }
}

function logEvent(code, arg) {
    if (silences.indexOf(code) >= 0) {
        return;
    }
    if (arg === undefined) {
        console.log('[event]', code);
    } else if (isString(arg)) {
        console.log('[event]', code, `"${arg}"`);
    } else {
        console.log('[event]', code, arg);
    }
}

let handling = 0;

export function handle(state, code, arg) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isHash(state)) {
            throw new Error('state must be an object');
        }
    }
    if (process.env.NODE_ENV === 'development') {
        // No logging in production or test modes
        logEvent(code, arg);
    }

    const list = handlers[code];
    if (!list) {
        return;
    }
    handling += 1;
    try {
        // for-of syntax gives bad tracebacks
        for (let i = 0; i < list.length; i += 1) {
            const func = list[i];
            func(state, arg);
        }
    } finally {
        handling -= 1;
    }
}
