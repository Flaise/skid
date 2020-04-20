const {addHandler, handle} = require('./event');

addHandler('load', (state) => {
    window.addEventListener('focus', () => handle(state, 'windowfocus'));
    window.addEventListener('blur', () => handle(state, 'windowblur'));
    window.addEventListener('resize', event => handle(state, 'resize'));

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            handle(state, 'pagehide');
        } else {
            handle(state, 'pageshow');
        }
    });
});

function mouseXY(event, component) {
    const x = event.pageX - (component.offsetLeft || 0);
    const y = event.pageY - (component.offsetTop || 0);
    return {x, y};
}

export function startMouseEvent(state, name, component, skidEventName=name) {
    component.addEventListener(name, (event) => {
        handle(state, skidEventName, mouseXY(event, component));
    });
}

window.addEventListener('drop', ((event) => event.preventDefault()), true);
window.addEventListener('dragover', ((event) => event.preventDefault()), true);
