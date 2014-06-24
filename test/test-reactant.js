
module('Reactant')
test('set/retrieve simple value', 2, function() {
    var reactant = new Reactant()
    reactant.value = 1
    deepEqual(reactant.value, 1)
    reactant.value = 5
    deepEqual(reactant.value, 5)
})
test('set/retrieve computed value', 2, function() {
    var reactant = new Reactant()
    reactant.setFunc(function() { return 4 })
    deepEqual(reactant.value, 4)
    reactant.setFunc(function() { return 'a' })
    deepEqual(reactant.value, 'a')
})
test('register/unregister callback', 2, function() {
    var reactant = new Reactant()
    reactant.value = 1
    var removal = reactant.listen(function(prev, curr) {
        strictEqual(prev, 1)
        strictEqual(curr, 4)
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
        deepEqual(prev, 'a')
        deepEqual(curr, 'az')
    })
    reactantB.listen(function(prev, curr) {
        deepEqual(prev, 'b')
        deepEqual(curr, 'bq')
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
        strictEqual(prev, 5)
        strictEqual(curr, 4)
    })
    reactant.value = 4
    reactant.value = 4
})
/*test('only proc when nonprimitive value changes', 2, function() {
	var reactant = new Reactant({ x:1, y:2 })
	reactant.value = { x:1, y:2 }
	reactant.listen(function(prev, curr) {
		deepEqual(prev, { x:1, y:2 })
		deepEqual(curr, { x:3, y:4 })
	})
	reactant.value = { x:3, y:4 }
	reactant.value = { x:3, y:4 }
})*/
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
test('reactant composition polling', 4, function() {
    var a = new Reactant(true)
    var b = new Reactant(true)
    var result = a.and(b)
    strictEqual(result.value, true)
    a.value = false
    strictEqual(result.value, false)
    b.value = false
    a.value = true
    strictEqual(result.value, false)

    b.value = true // result: false -> true, calls pass
    strictEqual(result.value, true)
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
    var result = a.onlyWhen(b)
    var remove = result.listen(fail)
    a.proc()
    b.value = true
    remove()
    result.listen(pass)
    a.proc()
})
/*test('set value of computed reactant', function() {
	var reactant = new Reactant()
	var closureValue = 1
	reactant.setFunc(function() { return closureValue }, function(x) { closureValue = x })
	strictEqual(reactant.value, 1)
	reactant.value =  // <- altering the behavior of this operation with setFunc() doesn't seem to make sense
})*/
test('optionally proc current value when registering listener', 4, function() {
    var reactant = new Reactant('a')
    var impl = function(prev, curr) {
        strictEqual(prev, undefined)
        strictEqual(curr, 'a')
        impl = function(prev, curr) {
            strictEqual(prev, 'a')
            strictEqual(curr, 'b')
        }
    }
    reactant.listen_pc(function(prev, curr) { impl(prev, curr) })
    reactant.value = 'b'
})
test('decrement repeatedly', function() { // invincibility bug (this wasn't the problem)
    for(var i = 0; i < 10; i += 1) {
        var reactant = new Reactant(2)
        strictEqual(reactant.value, 2)
        reactant.value -= 1
        strictEqual(reactant.value, 1)
        reactant.value -= 1
        strictEqual(reactant.value, 0)
    }
})
test('reactant transformation', 8, function() {
    var source = new Reactant(4)
    var transformation = source.transform(function(a) { return a > 4 })
    strictEqual(transformation.value, false)
    transformation.listenOnce(function(prev, curr) {
        strictEqual(prev, false)
        strictEqual(curr, true)
    })
    source.value = 5
    strictEqual(transformation.value, true)
    var removal = transformation.listen(fail)
    source.value = 6
    strictEqual(transformation.value, true)
    removal()
    transformation.listenOnce(function(prev, curr) {
        strictEqual(prev, true)
        strictEqual(curr, false)
    })
    source.value = 3
    strictEqual(transformation.value, false)
})
test('reactant event composition with itself', function() {
    var reactant = new Reactant(1)
    var composition = reactant.onlyWhen(reactant.transform(function(a) { return a > 5 }))

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
test('truthy events', function() {
    var counter = 0
    var reactant = new Reactant(0)
    reactant.anyTruthy.listen(function() {
        counter += 1
    })
    reactant.value = 1
    strictEqual(counter, 1)
    reactant.value = 2
    strictEqual(counter, 2)
    reactant.value = 0
    strictEqual(counter, 2)
    reactant.value = false
    strictEqual(counter, 2)
    reactant.value = true
    strictEqual(counter, 3)
    reactant.value = 'asdf'
    strictEqual(counter, 4)
    reactant.value = ''
    strictEqual(counter, 4)
    reactant.value = [1]
    strictEqual(counter, 5)
    reactant.value = null
    strictEqual(counter, 5)
})
test('falsy events', function() {
    var counter = 0
    var reactant = new Reactant(0)
    reactant.anyFalsy.listen(function() {
        counter += 1
    })
    reactant.value = 1
    strictEqual(counter, 0)
    reactant.value = 2
    strictEqual(counter, 0)
    reactant.value = 0
    strictEqual(counter, 1)
    reactant.value = false
    strictEqual(counter, 2)
    reactant.value = true
    strictEqual(counter, 2)
    reactant.value = 'asdf'
    strictEqual(counter, 2)
    reactant.value = ''
    strictEqual(counter, 3)
    reactant.value = [1]
    strictEqual(counter, 3)
    reactant.value = null
    strictEqual(counter, 4)
})
test('tuples', 4, function() {
    var a = new Reactant(1)
    var b = new Reactant(5)
    var tuple = Reactant.tuple(a, b)
    deepEqual(tuple.value, [1, 5])
    tuple.listen_pc(expectMultiSequence([
        [undefined, [1, 5]],
        [[1, 5], [4, 5]],
        [[4, 5], [4, 3]]
    ]))
    a.value = 4
    b.value = 3
    
    tuple.listen(fail)
    a.value = 4
    b.value = 3
})
test('assignment reassignment', 1, function() {
    var a = new Reactant(1)
    a.setValue = function(v) {
        strictEqual(v, 'a')
    }
    a.value = 'a'
})
