import assert from 'power-assert'
import {filter, insertSorted, remove, copy} from './array'

suite('array')

var arr
beforeEach(function() {
    arr = []
    for(var i = 0; i < 10; i += 1)
        arr.push(i)
})

test('remains sorted upon insertion - first', () => {
    insertSorted(arr, -1, (a, b) => b - a)
    assert.deepEqual(arr, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('remains sorted upon insertion - middle', () => {
    insertSorted(arr, 1.5, (a, b) => b - a)
    assert.deepEqual(arr, [0, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('remains sorted upon insertion - last', () => {
    insertSorted(arr, 10, (a, b) => b - a)
    assert.deepEqual(arr, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})

test('remains sorted upon insertion - duplicate', () => {
    insertSorted(arr, 1, (a, b) => b - a)
    assert.deepEqual(arr, [0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('filters nothing', () => {
    filter(arr, () => true)
    assert.deepEqual(arr, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('filters everything', () => {
    filter(arr, () => false)
    assert.deepEqual(arr, [])
})

test('fiters one element', () => {
    filter(arr, (a) => a !== 1)
    assert.deepEqual(arr, [0, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('fiters two disjoint elements', () => {
    filter(arr, (a) => a !== 1 && a !== 4)
    assert.deepEqual(arr, [0, 2, 3, 5, 6, 7, 8, 9])
})

test('fiters two adjacent elements', () => {
    filter(arr, (a) => a !== 1 && a !== 2)
    assert.deepEqual(arr, [0, 3, 4, 5, 6, 7, 8, 9])
})

test('filters first element', () => {
    filter(arr, (a) => a !== 0)
    assert.deepEqual(arr, [1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('filters last element', () => {
    filter(arr, (a) => a !== 9)
    assert.deepEqual(arr, [0, 1, 2, 3, 4, 5, 6, 7, 8])
})

test('removes one element - first', () => {
    remove(arr, 0)
    assert.deepEqual(arr, [1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('removes one element - middle', () => {
    remove(arr, 4)
    assert.deepEqual(arr, [0, 1, 2, 3, 5, 6, 7, 8, 9])
})

test('removes one element - last', () => {
    remove(arr, 9)
    assert.deepEqual(arr, [0, 1, 2, 3, 4, 5, 6, 7, 8])
})

test('removes nonexistent element', () => {
    remove(arr, 20)
    assert.deepEqual(arr, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('copies array', () => {
    const arr2 = copy(arr)
    assert(arr !== arr2)
    assert.deepEqual(arr, arr2)
})
