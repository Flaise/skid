import assert from 'power-assert'
import * as turns from './turns'

function close(a, b) {
    return Math.abs(a - b) < .0001
}

suite('turns')

test('wraps angles', function() {
    assert(turns.wrap(1) === 0)
    assert(turns.wrap(.5) === .5)
    assert(turns.wrap(-.5) === .5)
    assert(turns.wrap(.25) === .25)
    assert(turns.wrap(100) === 0)
    assert(turns.wrap(-100) === 0)
    assert(turns.wrap(-.25) === .75)
    assert(turns.wrap(-1.25) === .75)
    assert(turns.wrap(0) === 0)
})

test('computes the shortest offset', function() {
    assert(turns.shortestOffset(.5, .75) === .25)
    assert(turns.shortestOffset(.75, .5) === -.25)
    assert(turns.shortestOffset(0, .875) === -.125)
    assert(close(turns.shortestOffset(-.4, 0), .4))
    assert(turns.shortestOffset(2, 3) === 0)
    assert(turns.shortestOffset(2, 4) === 0)
    assert(turns.shortestOffset(-1, 4) === 0)
    assert(turns.shortestOffset(2, .25) === .25)
    assert(turns.shortestOffset(9.125, -.125) === -.25)
    assert(Math.abs(turns.shortestOffset(0, .5)) === .5)
    assert(Math.abs(turns.shortestOffset(.25, -.25)) === .5)
    assert(turns.shortestOffset(.125, -.125) === -.25)
})

test('generates a unit vector', () => {
    assert.deepEqual(turns.toVector(turns.NORTH), {x: 0, y: -1})
    assert.deepEqual(turns.toVector(turns.EAST), {x: 1, y: 0})
    assert.deepEqual(turns.toVector(turns.SOUTH), {x: 0, y: 1})
    assert.deepEqual(turns.toVector(turns.WEST), {x: -1, y: 0})
    
    let vec = turns.toVector(.125)
    assert(close(vec.x, Math.sqrt(2) / 2))
    assert(close(vec.y, Math.sqrt(2) / -2))
})

test('converts to and from radians', () => {
    assert(close(turns.fromRadians(turns.toRadians(0)), 0))
    assert(close(turns.fromRadians(turns.toRadians(.1)), .1))
    assert(close(turns.fromRadians(turns.toRadians(.5)), .5))
    assert(close(turns.fromRadians(turns.toRadians(-2)), -2))
})
