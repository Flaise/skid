import { addHandler, handle } from './event';

const states = Object.create(null);

export function reset() {
    for (const k of Object.keys(states)) {
        delete states[k];
    }
}

window.addEventListener('keydown', (e) => {
    const type = window.document.activeElement.type;
    if (type === 'textarea' || type === 'text' || type === 'password' || type === 'number') {
        // TODO: this doesn't account for holding the button while switching focus
        return;
    }

    states[e.keyCode] = true;
});
window.addEventListener('keyup', (e) => {
    states[e.keyCode] = false;
});

// TODO: use handler, not globals

export function stateOf(keyCode) {
    return !!states[keyCode];
}

addHandler('load_done', (state) => {
    window.addEventListener('keydown', (event) => onKey(state, event));
    window.addEventListener('keyup', (event) => onKey(state, event));
});

function onKey(state, event) {
    if (event.repeat) {
        return;
    }
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        if (event.code === 'Escape') {
            event.target.blur();
        }
        return;
    }
    handle(state, 'key', event);
}
