import assert from 'power-assert';
import * as turns from '../src/turns.js';

function close(a, b) {
    return Math.abs(a - b) < 0.0001;
}

suite('turns');

test('wraps angles', function() {
    assert(turns.wrap(1) === 0);
    assert(turns.wrap(0.5) === 0.5);
    assert(turns.wrap(-0.5) === 0.5);
    assert(turns.wrap(0.25) === 0.25);
    assert(turns.wrap(100) === 0);
    assert(turns.wrap(-100) === 0);
    assert(turns.wrap(-0.25) === 0.75);
    assert(turns.wrap(-1.25) === 0.75);
    assert(turns.wrap(0) === 0);
});

test('computes the shortest offset', function() {
    assert(turns.shortestOffset(0.5, 0.75) === 0.25);
    assert(turns.shortestOffset(0.75, 0.5) === -0.25);
    assert(turns.shortestOffset(0, 0.875) === -0.125);
    assert(close(turns.shortestOffset(-0.4, 0), 0.4));
    assert(turns.shortestOffset(2, 3) === 0);
    assert(turns.shortestOffset(2, 4) === 0);
    assert(turns.shortestOffset(-1, 4) === 0);
    assert(turns.shortestOffset(2, 0.25) === 0.25);
    assert(turns.shortestOffset(9.125, -0.125) === -0.25);
    assert(Math.abs(turns.shortestOffset(0, 0.5)) === 0.5);
    assert(Math.abs(turns.shortestOffset(0.25, -0.25)) === 0.5);
    assert(turns.shortestOffset(0.125, -0.125) === -0.25);
});

test('generates a unit vector', () => {
    assert.deepEqual(turns.toVector(turns.NORTH), { x: 0, y: -1 });
    assert.deepEqual(turns.toVector(turns.EAST), { x: 1, y: 0 });
    assert.deepEqual(turns.toVector(turns.SOUTH), { x: 0, y: 1 });
    assert.deepEqual(turns.toVector(turns.WEST), { x: -1, y: 0 });

    const vec = turns.toVector(0.125);
    assert(close(vec.x, Math.sqrt(2) / 2));
    assert(close(vec.y, Math.sqrt(2) / -2));
});

test('converts to and from radians', () => {
    assert(close(turns.fromRadians(turns.toRadians(0)), 0));
    assert(close(turns.fromRadians(turns.toRadians(0.1)), 0.1));
    assert(close(turns.fromRadians(turns.toRadians(0.5)), 0.5));
    assert(close(turns.fromRadians(turns.toRadians(-2)), -2));
});
