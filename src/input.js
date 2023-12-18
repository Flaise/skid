import { addHandler, handle } from './event.js';

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

// Saving the event instance so repeated mouse inputs don't take up gc resources.
const mouseEvent = { x: 0, y: 0, buttons: 0 };

export function startMouseEvent(state, eventName, component, skidEventName = eventName) {
    component.addEventListener(eventName, (event) => {
        mouseEvent.x = event.clientX;
        mouseEvent.y = event.clientY;
        mouseEvent.buttons = event.buttons;
        handle(state, skidEventName, mouseEvent);
    });
}

window.addEventListener('drop', (event) => event.preventDefault(), true);
window.addEventListener('dragover', (event) => event.preventDefault(), true);
