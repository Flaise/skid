'use strict'

var LinkedListNode = require('../index').LinkedListNode
var LinkedList = require('../index').LinkedList


describe('LinkedListNode', function() {
    it('can update its next node consistently', function() {
        var nodeA = new LinkedListNode('a')
        var nodeB = new LinkedListNode('b')
        var nodeC = new LinkedListNode('c')
        nodeA.next = nodeB
        expect(nodeA.next).toBe(nodeB)
        expect(nodeB.prev).toBe(nodeA)
        nodeA.next = nodeC
        expect(nodeA.next).toBe(nodeC)
        expect(nodeC.prev).toBe(nodeA)
        expect(nodeB.prev).toBeFalsy()
    })

    it('can update its previous node consistently', function() {
        var nodeA = new LinkedListNode('a')
        var nodeB = new LinkedListNode('b')
        var nodeC = new LinkedListNode('c')
        nodeA.prev = nodeB
        expect(nodeA.prev).toBe(nodeB)
        expect(nodeB.next).toBe(nodeA)
        nodeA.prev = nodeC
        expect(nodeA.prev).toBe(nodeC)
        expect(nodeC.next).toBe(nodeA)
        expect(nodeB.next).toBeFalsy()
    })
})

describe('LinkedList', function() {
    var list
    beforeEach(function() {
        list = new LinkedList()
    })

    it('addFirst, getFirst, getLast', function() {
        list.addFirst(1)
        expect(list.getFirst()).toBe(1)
        expect(list.getLast()).toBe(1)
    })

    it('addLast, getFirst, getLast', function() {
        list.addLast(5)
        expect(list.getFirst()).toBe(5)
        expect(list.getLast()).toBe(5)
    })

    it('addFirst twice, getFirst, getLast', function() {
        list.addFirst(1)
        list.addFirst(2)
        expect(list.getFirst()).toBe(2)
        expect(list.getLast()).toBe(1)
    })

    it('addFirst returns new node with given element', function() {
        expect(list.addFirst(-3).value).toBe(-3)
    })

    it('can remove a node from the middle of a list', function() {
        var nodeA = list.addLast(1)
        var nodeB = list.addLast(2)
        var nodeC = list.addLast(3)
        nodeB.remove()
        expect(nodeA.next).toBe(nodeC)
        expect(nodeC.prev).toBe(nodeA)
    })

    it('can remove the only node from a list', function() {
        list.addFirst(true).remove()
        expect(list.first).toBeFalsy()
        expect(list.last).toBeFalsy()
        list.addLast(false).remove()
        expect(list.first).toBeFalsy()
        expect(list.last).toBeFalsy()
    })

    it('removes one of two nodes, making other node both first and last', function() {
        var nodeA = list.addFirst(123)
        var nodeB = list.addLast(456)
        nodeB.remove()
        expect(list.getFirstNode()).toBe(nodeA)
        expect(list.getLastNode()).toBe(nodeA)
        nodeB = list.addFirst(789)
        nodeB.remove()
        expect(list.getFirstNode()).toBe(nodeA)
        expect(list.getLastNode()).toBe(nodeA)
    })

    it('removes a node twice safely', function() {
        var node = list.addFirst({})
        node.remove()
        node.remove()
        expect(list.empty).toBe(true)
    })

    it('can clear a list', function() {
        list.addLast(1)
        list.addLast(2)
        list.addLast(3)
        list.clear()
        expect(list.empty).toBe(true)
    })

    it('removes nodes without breaking iteration', function() {
        var callback = jasmine.createSpy('callback')

        list.forEach(callback)
        expect(callback.calls.all()).toEqual([])
        callback.calls.reset()

        list.addLast(1)
        var node = list.addLast(2)
        list.addLast(3)
        list.forEach(callback)
        expect(callback.calls.allArgs()).toEqual([
            [1], [2], [3]
        ])
        callback.calls.reset()

        node.remove()
        list.forEach(callback)
        expect(callback.calls.allArgs()).toEqual([
            [1], [3]
        ])
        callback.calls.reset()

        node.remove()
        list.forEach(callback)
        expect(callback.calls.allArgs()).toEqual([
            [1], [3]
        ])
        callback.calls.reset()
    })

    it('removes nodes during iteration', function() {
        var nodeA = list.addLast(1)
        var nodeB = list.addLast(2)
        var nodeC = list.addLast(3)

        var callback = jasmine.createSpy('callback').and.callFake(function(node) {
            node.remove()
        })
        list.forEachNode(callback)
        expect(callback.calls.allArgs()).toEqual([
            [nodeA], [nodeB], [nodeC]
        ])

        expect(list.head.next).toBe(list.tail)
        expect(list.tail.prev).toBe(list.head)
    })

    it('removes consecutive nodes during iteration', function() {
        var nodeA = list.addLast(1)
        var nodeB = list.addLast(2)
        var nodeC = list.addLast(3)

        var called = false
        list.forEachNode(function(node) {
            if(node === nodeA) {
                expect(called).toBe(false)
                called = true
                nodeA.remove()
                nodeB.remove()
            }
            else {
                expect(called).toBe(true)
                expect(node).toBe(nodeC)
            }
        })
        expect(list.head.next).toBe(nodeC)
        expect(list.tail.prev).toBe(nodeC)
    })

})
