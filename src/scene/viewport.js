import { Group } from './group.js';
import { isNullish } from '../is.js';
import { addHandler, handle } from '../event.js';

export function makeViewport(state, canvas) {
    const root = new Group();
    state.skid.viewport = { root, canvas };
    return root;
}

function drawFunc(state) {
    const currentFrame = Date.now();
    handle(state, 'before_draw', currentFrame - state.skid.lastFrame);
    const viewport = state.skid.viewport;
    if (viewport && viewport.canvas) {
        const context = viewport.canvas.getContext('2d');
        viewport.root.draw(context);
    }
    state.skid.willDraw = false;
    handle(state, 'after_draw');
    if (state.skid.willDraw) {
        state.skid.lastFrame = currentFrame;
    } else {
        state.skid.lastFrame = undefined;
    }
}

addHandler('request_draw', (state) => {
    if (state.skid.willDraw) {
        return;
    }
    state.skid.willDraw = true;
    if (isNullish(state.skid.lastFrame)) {
        state.skid.lastFrame = Date.now();
    }

    if (isNullish(state.skid.drawFunc)) {
        state.skid.drawFunc = () => drawFunc(state);
    }

    animationFrame(state.skid.drawFunc);
});

addHandler('load_done', (state) => {
    if (typeof window !== 'undefined') { // for unit testing in Node
        window.addEventListener('resize', () => handle(state, 'request_draw'));
    }
});

let func;
if (typeof window === 'undefined') {
    // for unit testing in Node
    func = (callback) => setTimeout(callback, 1000 / 60);
} else {
    func = (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame
    );
    if (func) {
        func = func.bind(window);
    } else {
        func = (callback) => window.setTimeout(callback, 1000 / 60);
    }
}

const animationFrame = func;
