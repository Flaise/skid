import { addHandler, handle } from './event';

addHandler('load', (state) => {
    window.addEventListener('focus', () => handle(state, 'windowfocus'));
    window.addEventListener('blur', () => handle(state, 'windowblur'));

    const resize = (event) => handle(state, 'resize');
    window.addEventListener('resize', resize);
    window.addEventListener('fullscreenchange', resize);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            handle(state, 'pagehide');
        } else {
            handle(state, 'pageshow');
        }
    });
});

export function startMouseEvent(state, eventName, component, skidEventName = eventName) {
    component.addEventListener(eventName, (event) => {
        handle(state, skidEventName, {
            x: event.clientX,
            y: event.clientY,
            buttons: event.buttons,
        });
    });
}

window.addEventListener('drop', (event) => event.preventDefault(), true);
window.addEventListener('dragover', (event) => event.preventDefault(), true);
