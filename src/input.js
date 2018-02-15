const {addHandler, handle} = require('./event');

addHandler('load_done', (state) => {
    window.addEventListener('focus', () => handle(state, 'windowfocus'));
    window.addEventListener('blur', () => handle(state, 'windowblur'));

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            handle(state, 'pagehide');
        } else {
            handle(state, 'pageshow');
        }
    });
});

function mouseXY(event, component) {
    const x = event.pageX - component.offsetLeft;
    const y = event.pageY - component.offsetTop;
    return {x, y};
}

export function startMouseEvent(state, name, component) {
    component.addEventListener(name, (event) => {
        handle(state, name, mouseXY(event, component));
    });
}
