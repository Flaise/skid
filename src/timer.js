import {addHandler, handle} from './event';

export function handleLater(state, delay, code, arg) {
    return callLater(state, delay, () => handle(state, code, arg));
}

export function handleInterval(state, delay, code, arg) {
    let timeout;
    function trigger() {
        handle(state, code, arg);
        timeout = callLater(state, delay, trigger);
    }
    timeout = callLater(state, delay, trigger);
    return {stop: () => clearTimeout(timeout)};
}

export function procrastinate(inCode, outCode, delay) {
    let timeout;
    addHandler(inCode, (state) => {
        clearTimeout(timeout);
        timeout = handleLater(state, delay, outCode);
    });
}

function callLater(state, delay, callback) {
    if (!state.timeRemainder) state.timeRemainder = 0;
    const targetTime = Date.now() + delay - state.timeRemainder;

    return setTimeout(() => {
        state.timeRemainder = Math.min(100, Date.now() - targetTime);
        callback();
        state.timeRemainder = 0;
    }, delay - state.timeRemainder);
}
