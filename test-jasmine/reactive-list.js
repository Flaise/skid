'use strict'

var ReactiveList = require('../index').ReactiveList


describe('Reactive List', function() {
    var list
    var callback
    var callback2
    beforeEach(function() {
        list = new ReactiveList()
        callback = jasmine.createSpy('callback')
        callback2 = jasmine.createSpy('callback2')
    })

    it('computes size', function() {
        list.size.listen(callback)

        var a = list.addFirst(1)
        var b = list.addFirst(-2)
        var c = list.addLast(3)
        a.remove()
        b.remove()
        c.remove()

        expect(callback.calls.allArgs()).toEqual([
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 2],
            [2, 1],
            [1, 0]
        ])
    })

    it('triggers events for appendation and removal', function() {
        list.onAdd.listen(callback)
        list.onRemove.listen(callback2)
        expect(callback.calls.count()).toBe(0)
        expect(callback2.calls.count()).toBe(0)

        var a = list.addFirst('a')
        expect(callback.calls.count()).toBe(1)
        expect(callback2.calls.count()).toBe(0)

        a.remove()
        expect(callback.calls.count()).toBe(1)
        expect(callback2.calls.count()).toBe(1)
    })

    it('triggers a node-specific remove event', function() {
        var node = list.addFirst(1)
        node.onRemove.listen(callback)
        expect(callback.calls.count()).toBe(0)
        node.remove()
        expect(callback.calls.count()).toBe(1)
        node.remove()
        expect(callback.calls.count()).toBe(1)
    })

    it('notifies listener of all currently stored elements', function() {
        list.addLast(4)
        list.addLast(3)

        list.onAddInvoke(callback)
        expect(callback.calls.allArgs()).toEqual([[4], [3]])

        list.addLast(8)
        expect(callback.calls.allArgs()).toEqual([[4], [3], [8]])
    })

    it('notifies listener of all currently stored nodes', function() {
        list.addLast(4)
        list.addLast(3)

        list.onAddNodeInvoke(callback)
        expect(callback.calls.count()).toBe(2)
        expect(callback.calls.allArgs()[0][0].value).toBe(4)
        expect(callback.calls.allArgs()[1][0].value).toBe(3)

        list.addLast(8)
        expect(callback.calls.count()).toBe(3)
        expect(callback.calls.allArgs()[2][0].value).toBe(8)
    })
})
