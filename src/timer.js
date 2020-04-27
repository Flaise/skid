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

function callingLater(state, callback, targetTime) {
    state.skid.timeRemainder = Math.min(100, Date.now() - targetTime);
    callback();
    state.skid.timeRemainder = 0;
}

export function callLater(state, delay, callback) {
    if (!state.skid.timeRemainder) state.skid.timeRemainder = 0;
    const targetTime = Date.now() + delay - state.skid.timeRemainder;

    return setTimeout(callingLater, delay - state.skid.timeRemainder, state, callback, targetTime);
}
