import assert from 'power-assert';
import sinon from 'sinon';
import { Translation } from '../src/scene/translation';
import { makeViewport } from '../src/scene/viewport';
import { handle } from '../src/event';

suite('Avatar');

let avatars;
let context;
let state;
beforeEach(function() {
    state = { skid: {} };
    context = {};
    const canvas = {
        getContext: function() {
            return context;
        },
    };
    avatars = makeViewport(state, canvas);
});

test('sorts avatars ascendingly', function() {
    const a = new Translation(state, avatars);
    a.layer = 10;

    const b = new Translation(state, avatars);
    b.layer = 2;

    assert(avatars.contents[0] === b);
    assert(avatars.contents[1] === a);
    assert(avatars.contents.length === 2);

    b.layer = 11;
    assert(avatars.contents[0] === a);
    assert(avatars.contents[1] === b);
    assert(avatars.contents.length === 2);
});

test('sorts many avatars', function() {
    const a = new Translation(state, avatars);
    a.layer = 1.001;
    const b = new Translation(state, avatars);
    b.layer = 999;
    const c = new Translation(state, avatars);
    c.layer = 1.001;
    const d = new Translation(state, avatars);
    d.layer = 1;
    const e = new Translation(state, avatars);
    e.layer = 5;
    const f = new Translation(state, avatars);
    f.layer = -2;
    const g = new Translation(state, avatars);
    g.layer = -2.1;
    const h = new Translation(state, avatars);
    const i = new Translation(state, avatars);
    i.layer = -1;
    h.layer = 4;

    assert(avatars.contents[0] === g);
    assert(avatars.contents[1] === f);
    assert(avatars.contents[2] === i);
    assert(avatars.contents[3] === d);
    assert(avatars.contents[4] === a || avatars.contents[4] === c);
    assert(avatars.contents[5] === c || avatars.contents[5] === a);
    assert(avatars.contents[6] === h);
    assert(avatars.contents[7] === e);
    assert(avatars.contents[8] === b);

    a.layer = 4;
    b.layer = 7;
    c.layer = -0.01;
    d.layer = -1;
    e.layer = 3.999;
    f.layer = 3.9999999;
    g.layer = 8;
    h.layer = 0;
    i.layer = 4;

    assert(avatars.contents[0] === d);
    assert(avatars.contents[1] === c);
    assert(avatars.contents[2] === h);
    assert(avatars.contents[3] === e);
    assert(avatars.contents[4] === f);
    assert(avatars.contents[5] === i);
    assert(avatars.contents[6] === a);
    assert(avatars.contents[7] === b);
    assert(avatars.contents[8] === g);
});

test('draws all avatars in order', function() {
    let i = 0;

    const a = new Translation(state, avatars);
    a.layer = 4;
    const b = new Translation(state, avatars);
    b.layer = 3;
    a.draw = sinon.spy(function(contextArg) {
        assert(contextArg === context);
        assert(i === 1);
        i += 1;
    });
    b.draw = sinon.spy(function(contextArg) {
        assert(contextArg === context);
        assert(i === 0);
        i += 1;
    });

    assert(avatars.contents[0] === b);
    assert(avatars.contents[1] === a);

    avatars.draw(context);
    assert(a.draw.called);
    assert(b.draw.called);
});

test('leaves no interpolands behind after removal', function() {
    const av = new Translation(state, avatars);
    av.remove();
    assert(av.removed);
    handle(state, 'before_draw', 0);
    assert(avatars.contents.length === 0);
    assert(state.skid.interpolands.interpolands.length === 0);

    // double-removal should have no effect
    av.remove();
    assert(av.removed);
    handle(state, 'before_draw', 0);
    assert(avatars.contents.length === 0);
    assert(state.skid.interpolands.interpolands.length === 0);
});

test('leaves no interpolands behind after multi-removal and calls all onRemoves', function() {
    const a = new Translation(state, avatars);
    const b = new Translation(state, avatars);
    const c = new Translation(state, avatars);

    a.remove();
    b.remove();
    c.remove();
    handle(state, 'before_draw', 0);
    assert(avatars.contents.length === 0);
    assert(state.skid.interpolands.interpolands.length === 0);
});

test('handles multiple creations and removals', function() {
    let e = new Translation(state, avatars);
    let d = new Translation(state, avatars);
    let c = new Translation(state, avatars);
    let b = new Translation(state, avatars);
    let a = new Translation(state, avatars);

    assert(avatars.contents.length === 5);
    assert(state.skid.interpolands.interpolands.length === 10);

    d.remove();
    handle(state, 'before_draw', 0);
    assert(avatars.contents[0] === a);
    assert(avatars.contents[1] === b);
    assert(avatars.contents[2] === c);
    assert(avatars.contents[3] === e);

    assert(avatars.contents.length === 4);
    assert(state.skid.interpolands.interpolands.length === 8);

    const dx = d;
    d = new Translation(state, avatars);
    assert(d !== dx);
    assert(avatars.contents[1] === a);
    assert(avatars.contents[0] === d);

    a.remove();
    handle(state, 'before_draw', 0);
    assert(avatars.contents.length === 4);
    assert(state.skid.interpolands.interpolands.length === 8);
    assert(avatars.contents[0] === d);
    assert(avatars.contents[1] === b);
    assert(avatars.contents[2] === c);
    assert(avatars.contents[3] === e);

    const ax = a;
    a = new Translation(state, avatars);
    assert(a !== ax);
    assert(avatars.contents.length === 5);
    assert(state.skid.interpolands.interpolands.length === 10);
    assert(avatars.contents[0] === a);

    c.remove();
    b.remove();
    e.remove();
    handle(state, 'before_draw', 0);
    assert(avatars.contents.length === 2);
    assert(state.skid.interpolands.interpolands.length === 4);
    assert(avatars.contents[0] === a);
    assert(avatars.contents[1] === d);

    e = new Translation(state, avatars);
    b = new Translation(state, avatars);
    c = new Translation(state, avatars);

    const f = new Translation(state, avatars);
    assert(avatars.contents.length === 6);
    assert(state.skid.interpolands.interpolands.length === 12);
    assert(avatars.contents[0] === f);
    assert(avatars.contents[1] === c);
    assert(avatars.contents[2] === b);
    assert(avatars.contents[3] === e);
    assert(avatars.contents[4] === a);
    assert(avatars.contents[5] === d);
});
