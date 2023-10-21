import assert from 'power-assert';
import { addHandler, handle } from '../src/event';

suite('Event');

let state;

beforeEach(() => {
    state = { skid: {} };
});

test('calls handler - string', () => {
    addHandler('a1', () => {
        state.a = 1;
    });
    handle(state, 'a1');
    assert(state.a === 1);
});

test('calls handler - number', () => {
    addHandler(5, () => {
        state.a = 1;
    });
    handle(state, 5);
    assert(state.a === 1);
});

test('event with no handler', () => {
    addHandler('a2', () => {
        state.a = 1;
    });
    handle(state, 'b2');
    assert(state.a === undefined);
});

test('2 handlers on same event', () => {
    addHandler('a3', () => {
        state.a = 1;
    });
    addHandler('a3', () => {
        state.a += 1;
    });
    handle(state, 'a3');
    assert(state.a === 2);
});

test('2 events for same handler', () => {
    addHandler('a4', () => {
        state.a = 1;
    });
    addHandler('a4 b4', () => {
        state.a += 1;
    });
    handle(state, 'a4');
    assert(state.a === 2);
    handle(state, 'b4');
    assert(state.a === 3);
});

test('2 events for same handler - array', () => {
    addHandler('a5', () => {
        state.a = 1;
    });
    addHandler(['a5', 'b5'], () => {
        state.a += 1;
    });
    handle(state, 'a5');
    assert(state.a === 2);
    handle(state, 'b5');
    assert(state.a === 3);
});

test('bad inputs', () => {
    assert.throws(() => {
        addHandler(undefined, () => {});
    });
    assert.throws(() => {
        addHandler('undefined r', () => {});
    });
    assert.throws(() => {
        addHandler('r');
    });
    assert.throws(() => {
        handle();
    });
    assert.throws(() => {
        handle('j');
    });
});
