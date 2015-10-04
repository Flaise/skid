// jest.dontMock('../src/reactant')
// jest.dontMock('../src/event-dispatcher')
// jest.dontMock('../src/linked-list')
// jest.dontMock('../src/linked-list-node')
const Reactant = require('../src/reactant')

describe.skip('Reactant', () => {
    let reactant, reactantA, reactantB, listener
    beforeEach(() => {
        reactant = new Reactant()
        reactantA = new Reactant()
        reactantB = new Reactant()
        listener = jest.genMockFunction()
    })
    
    it('sets/retrieves simple value', () => {
        reactant.value = 1
        expect(reactant.value).toEqual(1)
        reactant.value = 5
        expect(reactant.value).toEqual(5)
    })
    
    it('truthy events', () => {
        let counter = 0
        reactant.value = 0
        reactant.anyTruthy.listen(() => { counter += 1 })
        reactant.value = 1
        expect(counter).toBe(1)
        reactant.value = 2
        expect(counter).toBe(2)
        reactant.value = 0
        expect(counter).toBe(2)
        reactant.value = false
        expect(counter).toBe(2)
        reactant.value = true
        expect(counter).toBe(3)
        reactant.value = 'asdf'
        expect(counter).toBe(4)
        reactant.value = ''
        expect(counter).toBe(4)
        reactant.value = [1]
        expect(counter).toBe(5)
        reactant.value = null
        expect(counter).toBe(5)
    })
    
    it('falsy events', () => {
        let counter = 0
        reactant.value = 0
        reactant.anyFalsy.listen(() => { counter += 1 })
        reactant.value = 1
        expect(counter).toBe(0)
        reactant.value = 2
        expect(counter).toBe(0)
        reactant.value = 0
        expect(counter).toBe(1)
        reactant.value = false
        expect(counter).toBe(2)
        reactant.value = true
        expect(counter).toBe(2)
        reactant.value = 'asdf'
        expect(counter).toBe(2)
        reactant.value = ''
        expect(counter).toBe(3)
        reactant.value = [1]
        expect(counter).toBe(3)
        reactant.value = null
        expect(counter).toBe(4)
    })
    
    it('composition polling', 4, function() {
        reactantA.value = true
        reactantB.value = true
        const result = reactantA.and(reactantB)
        expect(result.value).toBe(true)
        reactantA.value = false
        expect(result.value).toBe(false)
        reactantB.value = false
        reactantA.value = true
        expect(result.value).toBe(false)
        reactantB.value = true
        expect(result.value).toBe(true)
    })
    
    describe('Tuples', () => {
        it('...', () => {
            reactantA.value = 1
            reactantB.value = 5
            
            const tuple = Reactant.tuple(reactantA, reactantB)
            expect(tuple.value).toEqual([1, 5])
            
            tuple.listen_pc(listener)
            reactantA.value = 4
            reactantB.value = 3
            
            reactantA.value = 4
            reactantB.value = 3
            
            expect(listener.mock.calls).toEqual([
                [undefined, [1, 5]],
                [[1, 5], [4, 5]],
                [[4, 5], [4, 3]]
            ])
        })
    })
})
/*
test('set/retrieve computed value', 2, function() {
    var reactant = new Reactant()
    reactant.setFunc(function() { return 4 })
    expect(reactant.value).toEqual(4)
    reactant.setFunc(function() { return 'a' })
    expect(reactant.value).toEqual('a')
})
test('register/unregister callback', 2, function() {
    var reactant = new Reactant()
    reactant.value = 1
    var removal = reactant.listen(function(prev, curr) {
        expect(prev).toBe(1)
        expect(curr).toBe(4)
    })
    reactant.value = 4
    removal()
    reactant.value = 8
})
test('multiple instance reaction', 4, function() {
    var reactantA = new Reactant()
    var reactantB = new Reactant()
    reactantA.value = 'a'
    reactantB.value = 'b'
    reactantA.listen(function(prev, curr) {
        expect(prev).toEqual('a')
        expect(curr).toEqual('az')
    })
    reactantB.listen(function(prev, curr) {
        expect(prev).toEqual('b')
        expect(curr).toEqual('bq')
    })
    reactantA.value = 'az'
    reactantB.value = 'bq'
})
test('on(value) reactant equality filter', 1, function() {
    var reactant = new Reactant()
    reactant.value = 1
    reactant.on(5).listen(function() {
        pass()
    })
    reactant.value = 4
    reactant.value = 5
    reactant.value = 2
})
test('only proc when value changes', 2, function() {
    var reactant = new Reactant(5)
    reactant.listen(function(prev, curr) {
        expect(prev).toBe(5)
        expect(curr).toBe(4)
    })
    reactant.value = 4
    reactant.value = 4
})
test('use strict equality for objects by default', 2, function() {
    var reactant = new Reactant({ a:1 })
    reactant.listen(pass)
    reactant.value = { a:1 }
    reactant.value = { a:2 }
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
        deepEqual(prev, {x:1, y:2, equals:equals})
        deepEqual(curr, {x:3, y:4, equals:equals})
    })
    reactant.value = b
    reactant.value = c
    reactant.value = c
})
test('discard multiple procs for function-derived reactant', 1, function() {
    var a = new Reactant()
    var closureVar = 1
    a.setFunc(function() { return closureVar })
    var removal = a.listen(fail)
    a.proc()
    a.proc()
    removal()
    removal = a.listen(pass)
    closureVar = 2
    a.proc()
    removal()
    removal = a.listen(fail)
    a.proc()
})
test('reactant composition events', 2, function() {
    var a = new Reactant(true)
    //a.listen(pass)
    //a.value = false

    var b = new Reactant(true)
    var result = a.and(b)
    result.listen(pass)

    //a.listen(pass)
    a.value = false // result: true -> false, calls pass

    var remove = result.listen(fail)
    b.value = false // should not change result and therefore should not proc event
    a.value = true // same
    remove()

    b.value = true // result: false -> true, calls pass
})
test('compose dispatcher with reactant', 1, function() {
    var a = new EventDispatcher()
    var b = new Reactant(false)
    var result = a.filter(b)
    var remove = result.listen(fail)
    a.proc()
    b.value = true
    remove()
    result.listen(pass)
    a.proc()
})
test('optionally proc current value when registering listener', 4, function() {
    var reactant = new Reactant('a')
    var impl = function(prev, curr) {
        expect(prev).toBe(undefined)
        expect(curr).toBe('a')
        impl = function(prev, curr) {
            expect(prev).toBe('a')
            expect(curr).toBe('b')
        }
    }
    reactant.listen_pc(function(prev, curr) { impl(prev, curr) })
    reactant.value = 'b'
})
test('decrement repeatedly', function() { // invincibility bug (this wasn't the problem)
    for(var i = 0; i < 10; i += 1) {
        var reactant = new Reactant(2)
        expect(reactant.value).toBe(2)
        reactant.value -= 1
        expect(reactant.value).toBe(1)
        reactant.value -= 1
        expect(reactant.value).toBe(0)
    }
})
test('reactant transformation', 8, function() {
    var source = new Reactant(4)
    var transformation = source.transform(function(a) { return a > 4 })
    expect(transformation.value).toBe(false)
    transformation.listenOnce(function(prev, curr) {
        expect(prev).toBe(false)
        expect(curr).toBe(true)
    })
    source.value = 5
    expect(transformation.value).toBe(true)
    var removal = transformation.listen(fail)
    source.value = 6
    expect(transformation.value).toBe(true)
    removal()
    transformation.listenOnce(function(prev, curr) {
        expect(prev).toBe(true)
        expect(curr).toBe(false)
    })
    source.value = 3
    expect(transformation.value).toBe(false)
})
test('reactant event composition with itself', function() {
    var reactant = new Reactant(1)
    var composition = reactant.filter(reactant.transform(function(a) { return a > 5 }))

    composition.listen(expectMultiSequence([
        [1, 6],
        [2, 10],
        [10, 12],
        [12, 6],
        [5, 6]
    ]))
    reactant.value = 6
    reactant.value = 3
    reactant.value = 2
    reactant.value = 10
    reactant.value = 12
    reactant.value = 6
    reactant.value = 5
    reactant.value = 6
})
test('assignment reassignment', 1, function() {
    var a = new Reactant(1)
    a.setValue = function(v) {
        expect(v).toBe('a')
    }
    a.value = 'a'
})
test('nested tuples', 4, function() {
    var a = new Reactant('a')
    var b = new Reactant('b')
    var c = new Reactant(1)
    var tuple = Reactant.tuple(Reactant.tuple(a, b), c)
    deepEqual(tuple.value, [['a', 'b'], 1])
    tuple.listen_pc(expectMultiSequence([
        [undefined, [['a', 'b'], 1]],
        [[['a', 'b'], 1], [['a', 2], 1]],
        [[['a', 2], 1], [['a', 2], 'rrr']]
    ]))
    b.value = 2
    c.value = 'rrr'
    
    tuple.listen(fail)
    b.value = 2
    c.value = 'rrr'
})
*/
