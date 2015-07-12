'use strict'

var EventDispatcher = require('../index').EventDispatcher


describe('EventDispatcher', function() {
    var dispatcher
    var dispatcher2
    var dispatcher3
    var stop
    var callback
    var callback2
    var callback3
    beforeEach(function() {
        dispatcher = new EventDispatcher()
        dispatcher2 = new EventDispatcher()
        dispatcher3 = new EventDispatcher()
        stop = new EventDispatcher()
        callback = jasmine.createSpy('callback')
        callback2 = jasmine.createSpy('callback2')
        callback3 = jasmine.createSpy('callback3')
    })

    it('notifies one listener', function() {
        dispatcher.listen(callback)
        expect(callback.calls.count()).toBe(0)
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
    })

    it('notifies two listeners', function() {
        dispatcher.listen(callback)
        dispatcher.listen(callback2)
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
        expect(callback2.calls.count()).toBe(1)
    })

    it('will not notify a removed listener', function() {
        dispatcher.listen(callback).remove()
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(0)
    })

    it('removes one listener without disturbing others', function() {
        dispatcher.listen(callback)
        var registration = dispatcher.listen(callback2)
        dispatcher.listen(callback3)
        registration.remove()
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
        expect(callback2.calls.count()).toBe(0)
        expect(callback3.calls.count()).toBe(1)
    })

    it('listens for an event once', function() {
        dispatcher.invoke()
        dispatcher.listenOnce(callback)
        dispatcher.invoke()
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
    })

    it('can remove a one-time listener before notification', function() {
        dispatcher.listenOnce(callback).remove()
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(0)
    })

    it('removes a one-time listener without disturbing other listeners', function() {
        dispatcher.listenOnce(callback)
        dispatcher.listen(callback2)

        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
        expect(callback2.calls.count()).toBe(1)

        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
        expect(callback2.calls.count()).toBe(2)
    })

    it('notifies two consecutive one-time listeners', function() {
        dispatcher.listenOnce(callback)
        dispatcher.listenOnce(callback2)
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
        expect(callback2.calls.count()).toBe(1)
    })

    it('does not notify listener added during notification', function() {
        callback.and.callFake(function() {
            dispatcher.listen(callback2)
        })
        dispatcher.listen(callback)
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
        expect(callback2.calls.count()).toBe(0)

        callback.and.stub()
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(2)
        expect(callback2.calls.count()).toBe(1)
    })

    it('can remove a listener during notification', function() {
        dispatcher.listen(callback)
        var registration = dispatcher.listen(callback2)
        callback2.and.callFake(function() {
            registration.remove()
        })
        dispatcher.listen(callback3)

        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
        expect(callback2.calls.count()).toBe(1)
        expect(callback3.calls.count()).toBe(1)

        dispatcher.invoke()
        expect(callback.calls.count()).toBe(2)
        expect(callback2.calls.count()).toBe(1)
        expect(callback3.calls.count()).toBe(2)
    })

    it('aggregates two dispatchers', function() {
        var aggregation = dispatcher.aggregate(dispatcher2)
        var registration = aggregation.listen(callback)

        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
        dispatcher2.invoke()
        expect(callback.calls.count()).toBe(2)

        registration.remove()

        dispatcher.invoke()
        expect(callback.calls.count()).toBe(2)
        dispatcher2.invoke()
        expect(callback.calls.count()).toBe(2)
    })

    it('any of three dispatchers', function() {
        var aggregation = EventDispatcher.object.any([dispatcher, dispatcher2, dispatcher3])
        var registration = aggregation.listen(callback)

        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
        dispatcher2.invoke()
        expect(callback.calls.count()).toBe(2)
        dispatcher3.invoke()
        expect(callback.calls.count()).toBe(3)

        registration.remove()

        dispatcher.invoke()
        expect(callback.calls.count()).toBe(3)
        dispatcher2.invoke()
        expect(callback.calls.count()).toBe(3)
        dispatcher3.invoke()
        expect(callback.calls.count()).toBe(3)
    })

    it('listens until another dispatcher fires', function() {
        dispatcher.listen(callback).until(stop)
        expect(callback.calls.count()).toBe(0)
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)
        stop.invoke()
        expect(callback.calls.count()).toBe(1)
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)

        expect(dispatcher.callbacks.empty).toBe(true)
        expect(stop.callbacks.empty).toBe(true)
    })

    it('listens until first of two dispatchers fire', function() {
        var registration = dispatcher.listen(callback)
        registration.until(dispatcher2)
        registration.until(dispatcher3)

        expect(callback.calls.count()).toBe(0)
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)

        dispatcher2.invoke()
        expect(dispatcher.callbacks.empty).toBe(true)

        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)

        dispatcher3.invoke()
        expect(dispatcher.callbacks.empty).toBe(true)
    })

    it('listens until second of two dispatchers fire', function() {
        var registration = dispatcher.listen(callback)
        registration.until(dispatcher2)
        registration.until(dispatcher3)

        expect(callback.calls.count()).toBe(0)
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)

        dispatcher3.invoke()
        expect(dispatcher.callbacks.empty).toBe(true)

        dispatcher.invoke()
        expect(callback.calls.count()).toBe(1)

        dispatcher2.invoke()
        expect(dispatcher.callbacks.empty).toBe(true)
    })

    it('removes one-time listener with an until binding', function() {
        dispatcher.listenOnce(callback).until(stop)
        stop.invoke()
        dispatcher.invoke()
        expect(callback.calls.count()).toBe(0)
    })

    it('leaves no listeners when manually removing one-time until-bound listener', function() {
        var registration = dispatcher.listenOnce(callback)
        registration.until(stop)
        registration.remove()
        expect(dispatcher.callbacks.empty).toBe(true)
        expect(stop.callbacks.empty).toBe(true)
    })

    it('passes a parameter to listeners', function() {
        dispatcher.listen(callback)
        dispatcher.invoke(9)
        dispatcher.invoke(2)
        expect(callback.calls.allArgs()).toEqual([[9], [2]])
    })
})
