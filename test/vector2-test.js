import {distanceXY, distance4XY, distance8XY} from './vector2'
import * as vector2 from './vector2'
import assert from 'power-assert'

suite('vector')

test('distance', () => {
    assert(distanceXY(0, 0, 0, 0) === 0)
    assert(distanceXY(0, 0, 1, 0) === 1)
    assert(distanceXY(0, 0, 0, 1) === 1)
    assert(distanceXY(0, 1, 0, 0) === 1)
    assert(distanceXY(-1, 0, 0, 0) === 1)
    assert(Math.abs(distanceXY(0, 0, 1, 1) - Math.sqrt(2)) < .00001)
    assert(Math.abs(distanceXY(0, 0, -1, -1) - Math.sqrt(2)) < .00001)
})

test('distance4XY', () => {
    assert(distance4XY(0, 0, 0, 0) === 0)
    assert(distance4XY(0, 0, 1, 0) === 1)
    assert(distance4XY(0, 0, 0, 1) === 1)
    assert(distance4XY(0, 1, 0, 0) === 1)
    assert(distance4XY(-1, 0, 0, 0) === 1)
    assert(distance4XY(-1, 1, 0, 0) === 2)
    assert(distance4XY(1, 0, 0, 1) === 2)
})

test('distance8XY', () => {
    assert(distance8XY(0, 0, 0, 0) === 0)
    assert(distance8XY(0, 0, 1, 0) === 1)
    assert(distance8XY(0, 0, 0, 1) === 1)
    assert(distance8XY(0, 1, 0, 0) === 1)
    assert(distance8XY(-1, 0, 0, 0) === 1)
    assert(distance8XY(-1, 1, 0, 0) === 1)
    assert(distance8XY(1, 0, 0, 1) === 1)
    assert(distance8XY(1, 0, 0, 2) === 2)
})

test('zero', () => {
    let zero = vector2.zero()
    assert.deepEqual(zero, {x: 0, y: 0})
    zero.x = 9
    
    zero = vector2.zero()
    assert.deepEqual(zero, {x: 0, y: 0})
})
