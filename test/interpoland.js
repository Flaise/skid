import assert from 'power-assert';
import sinon from 'sinon';
import { makeInterpoland } from '../src/interpolands';
import * as tween from '../src/tween';
import { handle } from '../src/event';

suite('Interpoland');

let interpolands;
let state;
beforeEach(function() {
    state = { skid: {} };
    makeInterpoland(state, 0).remove();
    interpolands = state.skid.interpolands;

    assert(interpolands.interpolands.length === 0);
    assert(interpolands.tweens.length === 0);
});

test('recycles second of 3', function() {
    const a = makeInterpoland(state, 1);
    const b = makeInterpoland(state, 2);
    const c = makeInterpoland(state, 3);
    assert(interpolands.interpolands.length === 3);

    b.remove();
    handle(state, 'before_draw', 0);
    assert(interpolands.interpolands.length === 2);

    assert(a.curr === 1);
    assert(a.dest === 1);
    assert(c.curr === 3);
    assert(c.dest === 3);
});

test('recycles second and third of 5', function() {
    const a = makeInterpoland(state, 1);
    const b = makeInterpoland(state, 2);
    const c = makeInterpoland(state, 3);
    const d = makeInterpoland(state, 4);
    const e = makeInterpoland(state, 5);
    assert(interpolands.interpolands.length === 5);

    b.remove();
    c.remove();
    handle(state, 'before_draw', 0);
    assert(interpolands.interpolands.length === 3);

    assert(a.curr === 1);
    assert(a.dest === 1);
    assert(d.curr === 4);
    assert(d.dest === 4);
    assert(e.curr === 5);
    assert(e.dest === 5);
});

test('recycles tween of destroyed interpolands', function() {
    const onDone = sinon.spy();

    let inter = makeInterpoland(state, 0);
    inter.mod(2, 1, tween.linear, onDone);
    assert(interpolands.tweens.length === 1);
    assert(onDone.callCount === 0);

    inter.remove();
    handle(state, 'before_draw', 0);
    assert(interpolands.tweens.length === 0);

    inter = makeInterpoland(state, 9);
    const tw = inter.modTo(7, 1, tween.linear);
    assert(tw);
    assert(tw.onDone !== onDone);
    assert(onDone.callCount === 0);
    assert(inter.curr === 9);
    assert(inter.dest === 7);
});

test('interpolates linearly', function() {
    const onDone = sinon.spy();

    const val = makeInterpoland(state, 1);
    assert(interpolands.interpolands.length === 1);
    assert(val.curr === 1);

    val.mod(2, 1, tween.powerFac(1), onDone);
    assert(onDone.callCount === 0);
    assert(val.dest === 3);
    handle(state, 'before_draw', 0.5);
    assert(onDone.callCount === 0);
    assert(val.curr === 2);

    handle(state, 'before_draw', 0.5);
    assert(onDone.called);
    assert(val.curr === 3);

    onDone.reset();
    handle(state, 'before_draw', 1);
    assert(onDone.callCount === 0);
    assert(val.curr === 3);
});

test('supports concurrent interpolations', function() {
    const onDoneA = sinon.spy();
    const onDoneB = sinon.spy();

    const inter = makeInterpoland(state, 5);
    inter.mod(-5, 1, tween.powerFac(1), onDoneA);
    assert(onDoneA.callCount === 0);
    assert(inter.curr === 5);
    assert(inter.dest === 0);

    inter.mod(-2, 2, tween.powerFac(1), onDoneB);
    assert(onDoneB.callCount === 0);
    assert(inter.curr === 5);
    assert(inter.dest === -2);
    assert(interpolands.tweens.length === 2);

    handle(state, 'before_draw', 1);
    assert(onDoneA.called);
    assert(onDoneB.callCount === 0);
    assert(inter.curr === -1);
    assert(inter.dest === -2);
    assert(interpolands.tweens.length === 1);

    onDoneA.reset();
    handle(state, 'before_draw', 1);
    assert(onDoneA.callCount === 0);
    assert(onDoneB.called);
    assert(inter.curr === -2);
    assert(inter.dest === -2);
    assert(interpolands.tweens.length === 0);
});

test('can halt interpolation and snap to a value', function() {
    const onDone = sinon.spy();

    const inter = makeInterpoland(state, 8);
    inter.mod(2, 1, tween.powerFac(1), onDone);
    assert(interpolands.tweens.length === 1);
    assert(onDone.callCount === 0);
    assert(inter.curr === 8);
    assert(inter.dest === 10);

    inter.setTo(5);
    assert(interpolands.tweens.length === 0);
    assert(onDone.callCount === 0);
    assert(inter.curr === 5);
    assert(inter.dest === 5);
});

test('can snap value without halting interpolation', function() {
    const inter = makeInterpoland(state, 9);
    inter.mod(5, 1, tween.powerFac(1));
    inter.modNow(1);
    assert(interpolands.tweens.length === 1);
    assert(inter.curr === 10);
    assert(inter.dest === 15);
    inter.modToNow(-1);
    assert(inter.curr === -6);
    assert(inter.dest === -1);
});

test('interpolates to a destination', function() {
    const onDoneA = sinon.spy();
    const onDoneB = sinon.spy();

    const inter = makeInterpoland(state, -4);
    inter.mod(2, 1, tween.powerFac(1), onDoneA);
    assert(onDoneA.callCount === 0);
    assert(inter.curr === -4);
    assert(inter.dest === -2);
    assert(interpolands.tweens.length === 1);

    inter.modTo(2, 1, tween.powerFac(1), onDoneB);
    assert(onDoneA.callCount === 0);
    assert(onDoneB.callCount === 0);
    assert(inter.curr === -4);
    assert(inter.dest === 2);
    assert(interpolands.tweens.length === 2);

    handle(state, 'before_draw', 0.5);
    assert(onDoneA.callCount === 0);
    assert(onDoneB.callCount === 0);
    assert(inter.curr === -1);
    assert(inter.dest === 2);
    assert(interpolands.tweens.length === 2);

    handle(state, 'before_draw', 0.5);
    assert(onDoneA.called);
    assert(onDoneB.called);
    assert(inter.curr === 2);
    assert(inter.dest === 2);
    assert(interpolands.tweens.length === 0);
});

test('maintains precision when chaining interpolations', function() {
    const onDoneB = sinon.spy(function() {
        assert(interpolands.remainder === 200);
    });
    const onDoneA = sinon.spy(function() {
        inter.mod(-1, 1000, tween.linear, onDoneB);
    });

    const inter = makeInterpoland(state, 0);
    inter.mod(1, 1000, tween.linear, onDoneA);
    assert(inter.dest === 1);

    handle(state, 'before_draw', 100);
    assert(onDoneA.callCount === 0);
    assert(inter.dest === 1);

    handle(state, 'before_draw', 1500);
    assert(onDoneA.called);
    onDoneA.reset();
    assert(onDoneB.callCount === 0);
    assert(inter.dest === 0);

    handle(state, 'before_draw', 600);
    assert(onDoneA.callCount === 0);
    assert(onDoneB.called);
    assert(inter.curr === 0);
    assert(inter.dest === 0);
});

test('maintains precision when chaining interpolations without remainder parameter', function() {
    const onDoneB = sinon.spy(function() {
        assert(interpolands.remainder === 200);
    });
    const onDoneA = sinon.spy(function() {
        inter.mod(-1, 1000, tween.linear, onDoneB);
    });

    const inter = makeInterpoland(state, 0);
    inter.mod(1, 1000, tween.linear, onDoneA);
    assert(inter.dest === 1);

    handle(state, 'before_draw', 100);
    assert(onDoneA.callCount === 0);
    assert(inter.dest === 1);

    handle(state, 'before_draw', 1500);
    assert(onDoneA.called);
    onDoneA.reset();
    assert(onDoneB.callCount === 0);
    assert(inter.dest === 0);

    handle(state, 'before_draw', 600);
    assert(onDoneA.callCount === 0);
    assert(onDoneB.called);
    assert(inter.curr === 0);
    assert(inter.dest === 0);

    const tweenC = inter.modTo(1, 1000, tween.linear);
    assert(inter.curr === 0);
    assert(inter.dest === 1);
    assert(tweenC.elapsed === 0);
});

test('interpolates with no net change', function() {
    const inter = makeInterpoland(state, 5);
    assert(inter.curr === 5);
    assert(inter.dest === 5);

    inter.mod_noDelta(2, 1000, function(x) {
        return Math.sin(x * Math.PI * 2);
    });
    assert(inter.curr === 5);
    assert(inter.dest === 5);

    handle(state, 'before_draw', 250);
    assert(inter.curr === 7);
    assert(inter.dest === 5);

    handle(state, 'before_draw', 250);
    assert(inter.curr === 5);
    assert(inter.dest === 5);

    handle(state, 'before_draw', 250);
    assert(inter.curr === 3);
    assert(inter.dest === 5);

    handle(state, 'before_draw', 250);
    assert(inter.curr === 5);
    assert(inter.dest === 5);

    handle(state, 'before_draw', 100);
    assert(inter.curr === 5);
    assert(inter.dest === 5);
});

test('removes one interpoland without disturbing tweens of others', function() {
    const interA = makeInterpoland(state, 5);
    interA.mod(-1, 1, tween.linear);
    interA.mod(4, 4, tween.linear);
    const interB = makeInterpoland(state, 3);
    interB.mod(2, 2, tween.linear);
    interA.mod(-5, 5, tween.linear);
    interB.mod(3, 3, tween.linear);

    assert(interA.dest === 3);
    assert(interB.dest === 8);
    assert(interpolands.interpolands.length === 2);
    assert(interpolands.tweens.length === 5);

    interA.remove();
    handle(state, 'before_draw', 0);
    assert(interB.dest === 8);
    assert(interpolands.interpolands.length === 1);
    assert(interpolands.tweens.length === 2);
});

test('will not update tweens that are added during update', function() {
    const inter = makeInterpoland(state, 0);
    let tweenB;
    const onDone = sinon.spy(() => {
        assert(interpolands.remainder === 0);
        tweenB = inter.mod(-1, 50, tween.circle);
    });
    inter.mod(1, 100, tween.linear, onDone);

    handle(state, 'before_draw', 100);
    assert(onDone.calledOnce);
    assert(inter.curr === 1);
    assert(inter.dest === 0);
    assert(interpolands.tweens.length === 1);
    assert(tweenB.magnitude === -1);
    assert(tweenB.duration === 50);
    assert(!tweenB.onDone);
    assert(tweenB.func === tween.circle);
});
