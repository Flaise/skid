'use strict'

var LinkedListNode = require('../index').LinkedListNode


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

    it('asdf', function() {

    })

})
