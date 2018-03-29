import assert from 'power-assert';
import {addHandler, handle, clearHandlers} from '../src/event';

suite('Event');

let state;

beforeEach(() => {
    state = {};
});

afterEach(() => {
    clearHandlers();
});

test('calls handler - string', () => {
    addHandler('a', () => {
        state.a = 1;
    });
    handle(state, 'a');
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
    addHandler('a', () => {
        state.a = 1;
    });
    handle(state, 'b');
    assert(state.a === undefined);
});

test('2 handlers on same event', () => {
    addHandler('a', () => {
        state.a = 1;
    });
    addHandler('a', () => {
        state.a += 1;
    });
    handle(state, 'a');
    assert(state.a === 2);
});

test('2 events for same handler', () => {
    addHandler('a', () => {
        state.a = 1;
    });
    addHandler('a b', () => {
        state.a += 1;
    });
    handle(state, 'a');
    assert(state.a === 2);
    handle(state, 'b');
    assert(state.a === 3);
});

test('2 events for same handler - array', () => {
    addHandler('a', () => {
        state.a = 1;
    });
    addHandler(['a', 'b'], () => {
        state.a += 1;
    });
    handle(state, 'a');
    assert(state.a === 2);
    handle(state, 'b');
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
