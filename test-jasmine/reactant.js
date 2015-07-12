'use strict'

var Reactant = require('../index').Reactant
var EventDispatcher = require('../index').EventDispatcher


describe('Reactant', function() {
    var reactant
    var callback
    beforeEach(function() {
        reactant = new Reactant()
        callback = jasmine.createSpy('callback')
    })

    it('sets/retrieves simple value', function() {
        reactant.value = 1
        expect(reactant.value).toBe(1)
        reactant.value = -4
        expect(reactant.value).toBe(-4)
    })

    it('sets/retrieves computed value', function() {
        reactant.define(function() { return 4 })
        expect(reactant.value).toBe(4)

        reactant.define(function() { return -6 })
        expect(reactant.value).toBe(-6)
    })

    it('notifies a listener of changes', function() {
        reactant.value = 1
        reactant.listen(callback)
        reactant.value = 2
        reactant.value = 3
        reactant.value = -9
        expect(callback.calls.allArgs()).toEqual([[1, 2], [2, 3], [3, -9]])
    })

    it('can unregister a listener', function() {
        reactant.listen(callback).remove()
        reactant.value = 1
        expect(callback.calls.count()).toBe(0)
    })

    it('notifies upon changing to a particular value', function() {
        reactant.value = 1
        reactant.on(5).listen(callback)
        expect(callback.calls.count()).toBe(0)
        reactant.value = 4
        expect(callback.calls.count()).toBe(0)
        reactant.value = 5
        expect(callback.calls.count()).toBe(1)
        reactant.value = 2
        expect(callback.calls.count()).toBe(1)
    })

    it('does not notify when value is reassigned without changing', function() {
        reactant.value = 1
        reactant.listen(callback)
        reactant.value = 1
        reactant.value = 1
        expect(callback.calls.count()).toBe(0)
    })

    it('disregards multiple events for function/event-derived reactant', function() {
        var dispatcher = new EventDispatcher()
        reactant.define(function() { return 9 }, dispatcher)
        reactant.listen(callback)
        expect(reactant.value).toBe(9)
        dispatcher.invoke()
        expect(reactant.value).toBe(9)
        dispatcher.invoke()
        expect(reactant.value).toBe(9)
        expect(callback.calls.count()).toBe(0)
    })

    it('notifies listeners when function/event-derived reactant changes', function() {
        var dispatcher = new EventDispatcher()
        var z = 1
        reactant.define(function() { return z }, dispatcher)
        reactant.listen(callback)
        expect(reactant.value).toBe(1)
        expect(callback.calls.count()).toBe(0)

        z = 7
        dispatcher.invoke()
        expect(callback.calls.allArgs()).toEqual([[1, 7]])
    })

    it('can poll compositions', function() {
        var a = new Reactant(true)
        var b = new Reactant(false)
        var composition = a.and(b)

        expect(composition.value).toBe(false)
        a.value = false
        expect(composition.value).toBe(false)
        b.value = false
        expect(composition.value).toBe(false)
        a.value = true
        expect(composition.value).toBe(false)
        b.value = true
        expect(composition.value).toBe(true)
    })

    it('can increment a numeric reactant', function() {
        reactant.value = 1
        reactant.value += 1
        expect(reactant.value).toBe(2)
    })

    it('can transform a reactant', function() {
        reactant.value = 4
        var transformed = reactant.transform(function(a) { return a > 4 })
        transformed.listen(callback)

        expect(transformed.value).toBe(false)
        expect(callback.calls.count()).toBe(0)

        reactant.value = 5
        expect(callback.calls.allArgs()).toEqual([[false, true]])
        callback.calls.reset()

        reactant.value = 6
        expect(callback.calls.count()).toBe(0)

        reactant.value = 3
        expect(callback.calls.allArgs()).toEqual([[true, false]])
    })

    it('can notify a listener upon registration', function() {
        reactant.value = 1
        reactant.listenAndInvoke(callback)
        expect(callback.calls.count()).toBe(1)
        reactant.value = -2
        expect(callback.calls.count()).toBe(2)
    })

    it('composes numeric and boolean reactants', function() {
        expect(new Reactant(3).plus(new Reactant(4)).value).toBe(7)
        expect(new Reactant(3).minus(new Reactant(4)).value).toBe(-1)
        expect(new Reactant(3).times(new Reactant(4)).value).toBe(12)
        expect(new Reactant(3).div(new Reactant(4)).value).toBe(.75)
        expect(new Reactant(3).negative().value).toBe(-3)

        expect(new Reactant(true).and(new Reactant(false)).value).toBe(false)
        expect(new Reactant(true).or(new Reactant(false)).value).toBe(true)
        expect(new Reactant(true).not().value).toBe(false)
    })

    // TODO
    //it('can combine reactants into a tuple', function() {
    //
    //})
})
