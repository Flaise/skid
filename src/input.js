const {addHandler, handle} = require('./event');

addHandler('load_done', (state) => {
    window.addEventListener('focus', () => handle(state, 'windowfocus'));
    window.addEventListener('blur', () => handle(state, 'windowblur'));
    window.addEventListener('keydown', event => onKey(state, event));
    window.addEventListener('keyup', event => onKey(state, event));

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            handle(state, 'pagehide');
        } else {
            handle(state, 'pageshow');
        }
    });
});

function onKey(state, event) {
    if (event.repeat) return;
    if (event.target.tagName === 'INPUT') {
        if (event.code === 'Escape') event.target.blur();
        return;
    }
    handle(state, 'key', event);
}

function mouseXY(event, component) {
    const x = event.pageX - (component.offsetLeft || 0);
    const y = event.pageY - (component.offsetTop || 0);
    return {x, y};
}

export function startMouseEvent(state, name, component) {
    component.addEventListener(name, (event) => {
        handle(state, name, mouseXY(event, component));
    });
}

window.addEventListener('drop', ((event) => event.preventDefault()), true);
window.addEventListener('dragover', ((event) => event.preventDefault()), true);
