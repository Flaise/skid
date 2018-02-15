import assert from 'power-assert';
import lolex from 'lolex';
import sinon from 'sinon';
import {clearHandlers, addHandler, handle} from '../src/event';
import {procrastinate} from '../src/timer';

suite('Timer');

let clock, callback, state;

before(() => {
    clock = lolex.install();
});

beforeEach(() => {
    state = {};
    callback = sinon.spy();
    procrastinate('a', 'b', 50);
    addHandler('b', callback);
});

afterEach(() => {
    clearHandlers();
});

after(() => {
    clock.uninstall();
});

test('event after delay', () => {
    handle(state, 'a');
    assert(!callback.called);
    clock.tick(49);
    assert(!callback.called);
    clock.tick(1);
    assert(callback.called);
});

test('resets delay', () => {
    handle(state, 'a');
    assert(!callback.called);
    clock.tick(10);
    assert(!callback.called);
    handle(state, 'a');
    assert(!callback.called);
    clock.tick(50);
    assert(callback.called);
});
