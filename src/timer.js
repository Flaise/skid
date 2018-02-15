import {addHandler, handle} from './event';

export function handleLater(state, delay, code, arg) {
    return setTimeout(() => handle(state, code, arg), delay);
    // TODO: time remainder calculation would go here
}

export function procrastinate(inCode, outCode, delay) {
    let timeout;
    addHandler(inCode, (state) => {
        clearTimeout(timeout);
        timeout = handleLater(state, delay, outCode);
    });
}
