import assert from 'power-assert';
import lolex from 'lolex';
import sinon from 'sinon';
import {addHandler, handle} from '../src/event';
import {procrastinate} from '../src/timer';

suite('Timer');

let clock, callback, state;

before(() => {
    clock = lolex.install();
});

beforeEach(() => {
    state = {skid: {}};
    callback = sinon.spy();
});

after(() => {
    clock.uninstall();
});

test('event after delay', () => {
    procrastinate('a', 'b', 50);
    addHandler('b', callback);
    handle(state, 'a');
    assert(!callback.called);
    clock.tick(49);
    assert(!callback.called);
    clock.tick(1);
    assert(callback.called);
});

test('resets delay', () => {
    procrastinate('r', 's', 50);
    addHandler('s', callback);
    handle(state, 'r');
    assert(!callback.called);
    clock.tick(10);
    assert(!callback.called);
    handle(state, 'r');
    assert(!callback.called);
    clock.tick(50);
    assert(callback.called);
});
