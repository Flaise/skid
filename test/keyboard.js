// import assert from 'power-assert';
// import simulate from 'simulate-dom-event'; // this was version 1.0.3
// import { stateOf, reset } from '../src/keyboard.js'; // Can't import because it references window
// import * as key from '../src/key.js';

suite('keyboard');

// const keyCodes = Object.keys(key).filter((a) => a !== 'nameOf').map((a) => key[a]);

beforeEach(() => {
    // reset();
});

// TODO:
// test('everything is initially unpressed', () => {
//     for (const k of keyCodes) {
//         assert(stateOf(k) === false);
//     }
// });

// TODO:
// test('keydown event changes key state', () => {
//     for (const k of keyCodes) {
//         simulate(window, 'keydown', { keyCode: k });
//         assert(stateOf(k) === true);
//     }
// });
