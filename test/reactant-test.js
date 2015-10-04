import assert from 'power-assert'
import sinon from 'sinon'
import Reactant from '../src/reactant'
import EventDispatcher from '../src/event-dispatcher'

suite('Reactant')

let reactant, reactantA, reactantB, listener
beforeEach(() => {
    reactant = new Reactant()
    reactantA = new Reactant()
    reactantB = new Reactant()
    listener = sinon.spy()
})

test('sets/retrieves simple value', () => {
    reactant.value = 1
    assert(reactant.value === 1)
    reactant.value = 5
    assert(reactant.value === 5)
})

test('truthy events', () => {
    let counter = 0
    reactant.value = 0
    reactant.anyTruthy.listen(() => { counter += 1 })
    reactant.value = 1
    assert(counter === 1)
    reactant.value = 2
    assert(counter === 2)
    reactant.value = 0
    assert(counter === 2)
    reactant.value = false
    assert(counter === 2)
    reactant.value = true
    assert(counter === 3)
    reactant.value = 'asdf'
    assert(counter === 4)
    reactant.value = ''
    assert(counter === 4)
    reactant.value = [1]
    assert(counter === 5)
    reactant.value = null
    assert(counter === 5)
})

test('falsy events', () => {
    let counter = 0
    reactant.value = 0
    reactant.anyFalsy.listen(() => { counter += 1 })
    reactant.value = 1
    assert(counter === 0)
    reactant.value = 2
    assert(counter === 0)
    reactant.value = 0
    assert(counter === 1)
    reactant.value = false
    assert(counter === 2)
    reactant.value = true
    assert(counter === 2)
    reactant.value = 'asdf'
    assert(counter === 2)
    reactant.value = ''
    assert(counter === 3)
    reactant.value = [1]
    assert(counter === 3)
    reactant.value = null
    assert(counter === 4)
})

test('composition polling', function() {
    reactantA.value = true
    reactantB.value = true
    const result = reactantA.and(reactantB)
    assert(result.value === true)
    reactantA.value = false
    assert(result.value === false)
    reactantB.value = false
    reactantA.value = true
    assert(result.value === false)
    reactantB.value = true
    assert(result.value === true)
})

test('tuples', () => {
    reactantA.value = 1
    reactantB.value = 5
    
    const tuple = Reactant.tuple(reactantA, reactantB)
    assert.deepEqual(tuple.value, [1, 5])
    
    tuple.listen_pc(listener)
    reactantA.value = 4
    reactantB.value = 3
    
    reactantA.value = 4
    reactantB.value = 3
    
    assert.deepEqual(listener.args, [
        [undefined, [1, 5]],
        [[1, 5], [4, 5]],
        [[4, 5], [4, 3]]
    ])
})

test('set/retrieve computed value', function() {
    var reactant = new Reactant()
    reactant.setFunc(function() { return 4 })
    assert(reactant.value === 4)
    reactant.setFunc(function() { return 'a' })
    assert(reactant.value === 'a')
})
test('register/unregister callback', function() {
    var reactant = new Reactant()
    reactant.value = 1
    var removal = reactant.listen(function(prev, curr) {
        assert(prev === 1)
        assert(curr === 4)
    })
    reactant.value = 4
    removal()
    reactant.value = 8
})
test('multiple instance reaction', function() {
    var reactantA = new Reactant()
    var reactantB = new Reactant()
    reactantA.value = 'a'
    reactantB.value = 'b'
    reactantA.listen(function(prev, curr) {
        assert(prev === 'a')
        assert(curr === 'az')
    })
    reactantB.listen(function(prev, curr) {
        assert(prev === 'b')
        assert(curr === 'bq')
    })
    reactantA.value = 'az'
    reactantB.value = 'bq'
})
test('on(value) reactant equality filter', function() {
    var reactant = new Reactant()
    reactant.value = 1
    reactant.on(5).listen(listener)
    reactant.value = 4
    reactant.value = 5
    reactant.value = 2
    assert(listener.calledOnce)
})
test('only proc when value changes', function() {
    var reactant = new Reactant(5)
    reactant.listen(function(prev, curr) {
        assert(prev === 5)
        assert(curr === 4)
    })
    reactant.value = 4
    reactant.value = 4
})
test('use strict equality for objects by default', function() {
    reactant.listen(listener)
    reactant.value = { a:1 }
    reactant.value = { a:2 }
    assert.deepEqual(listener.args, [[undefined, {a: 1}], [{a: 1}, {a: 2}]])
})
test('use equals() methods of values', function() {
    function equals(other) {
        if(!other) return false
        return this.x === other.x && this.y === other.y
    }
    var a = {x:1, y:2, equals:equals}
    var b = {x:1, y:2, equals:equals}
    var c = {x:3, y:4, equals:equals}
    var reactant = new Reactant(a)
    reactant.listen(function(prev, curr) {
        assert.deepEqual(prev, {x:1, y:2, equals:equals})
        assert.deepEqual(curr, {x:3, y:4, equals:equals})
    })
    reactant.value = b
    reactant.value = c
    reactant.value = c
})
test('discard multiple procs for function-derived reactant', function() {
    var a = new Reactant()
    var closureVar = 1
    a.setFunc(function() { return closureVar })
    
    a.listen(listener)
    a.proc()
    a.proc()
    assert(listener.callCount === 0)
    
    closureVar = 2
    a.proc()
    assert(listener.callCount === 1)
    
    a.proc()
    assert(listener.callCount === 1)
})
test('reactant composition events', function() {
    var a = new Reactant(true)
    var b = new Reactant(true)
    var result = a.and(b)
    result.listen(listener)

    a.value = false // result: true -> false, calls
    assert(listener.calledOnce)

    b.value = false // should not change result and therefore should not proc event
    a.value = true // same
    assert(listener.calledOnce)

    b.value = true // result: false -> true, calls
    assert(listener.calledTwice)
})
test('compose dispatcher with reactant', function() {
    var a = new EventDispatcher()
    var b = new Reactant(false)
    var result = a.filter(b)
    var remove = result.listen(listener)
    a.proc()
    b.value = true
    assert(listener.callCount === 0)
    a.proc()
    assert(listener.calledOnce)
})
test('optionally proc current value when registering listener', function() {
    var reactant = new Reactant('a')
    var impl = function(prev, curr) {
        assert(prev === undefined)
        assert(curr === 'a')
        impl = function(prev, curr) {
            assert(prev === 'a')
            assert(curr === 'b')
        }
    }
    reactant.listen_pc(function(prev, curr) { impl(prev, curr) })
    reactant.value = 'b'
})
test('decrement repeatedly', function() { // invincibility bug (this wasn't the problem)
    for(var i = 0; i < 10; i += 1) {
        var reactant = new Reactant(2)
        assert(reactant.value === 2)
        reactant.value -= 1
        assert(reactant.value === 1)
        reactant.value -= 1
        assert(reactant.value === 0)
    }
})
test('reactant transformation', function() {
    var source = new Reactant(4)
    var transformation = source.transform(function(a) { return a > 4 })
    transformation.listen(listener)
    
    assert(transformation.value === false)
    source.value = 5
    assert(transformation.value === true)
    source.value = 6
    assert(transformation.value === true)
    source.value = 3
    assert(transformation.value === false)
    
    assert.deepEqual(listener.args, [
        [false, true],
        [true, false]
    ])
})

test('reactant event composition with itself', function() {
    var reactant = new Reactant(1)
    var composition = reactant.filter(reactant.transform(function(a) { return a > 5 }))

    composition.listen(listener)
    reactant.value = 6
    reactant.value = 3
    reactant.value = 2
    reactant.value = 10
    reactant.value = 12
    reactant.value = 6
    reactant.value = 5
    reactant.value = 6
    
    assert.deepEqual(listener.args, [
        [1, 6],
        [2, 10],
        [10, 12],
        [12, 6],
        [5, 6]
    ])
})

test('assignment reassignment', function() {
    var a = new Reactant(1)
    a.setValue = function(v) {
        assert(v === 'a')
    }
    a.value = 'a'
})
test('nested tuples', function() {
    var a = new Reactant('a')
    var b = new Reactant('b')
    var c = new Reactant(1)
    var tuple = Reactant.tuple(Reactant.tuple(a, b), c)
    assert.deepEqual(tuple.value, [['a', 'b'], 1])
    tuple.listen_pc(listener)
    b.value = 2
    c.value = 'rrr'
    b.value = 2
    c.value = 'rrr'
    
    assert.deepEqual(listener.args, [
        [undefined, [['a', 'b'], 1]],
        [[['a', 'b'], 1], [['a', 2], 1]],
        [[['a', 2], 1], [['a', 2], 'rrr']]
    ])
})
