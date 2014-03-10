
module('LinkedListNode')
test('setting next node', function() {
    var nodeA = new LinkedListNode('a')
    var nodeB = new LinkedListNode('b')
    var nodeC = new LinkedListNode('c')
    nodeA.next = nodeB
    strictEqual(nodeA.next, nodeB)
    strictEqual(nodeB.prev, nodeA)
    nodeA.next = nodeC
    strictEqual(nodeA.next, nodeC)
    strictEqual(nodeC.prev, nodeA)
    strictEqual(nodeB.prev, undefined)
})
test('setting prev node', function() {
    var nodeA = new LinkedListNode('a')
    var nodeB = new LinkedListNode('b')
    var nodeC = new LinkedListNode('c')
    nodeA.prev = nodeB
    strictEqual(nodeA.prev, nodeB)
    strictEqual(nodeB.next, nodeA)
    nodeA.prev = nodeC
    strictEqual(nodeA.prev, nodeC)
    strictEqual(nodeC.next, nodeA)
    strictEqual(nodeB.next, undefined)
})


module('LinkedList')
test('addFirst then getFirst and getLast', function() {
    var list = new LinkedList()
    list.addFirst(1)
    deepEqual(list.getFirst(), 1)
    deepEqual(list.getLast(), 1)
})
test('addLast then getFirst and getLast', function() {
    var list = new LinkedList()
    list.addLast(5)
    deepEqual(list.getFirst(), 5)
    deepEqual(list.getLast(), 5)
})
test('addFirst twice then getFirst and getLast', function() {
    var list = new LinkedList()
    list.addFirst(1)
    list.addFirst(2)
    deepEqual(list.getFirst(), 2)
    deepEqual(list.getLast(), 1)
})
test('addFirst returns a new node with the element', function() {
    var list = new LinkedList()
    deepEqual(list.addFirst('asdf').value, 'asdf')
})
test('removing a node from middle of a list', function() {
    var list = new LinkedList()
    var nodeA = list.addLast(1)
    var nodeB = list.addLast(2)
    var nodeC = list.addLast(3)
    nodeB.remove()
    strictEqual(nodeA.next, nodeC)
    strictEqual(nodeC.prev, nodeA)
})
test('removing only node from a list', function() {
    var list = new LinkedList()
    list.addFirst(true).remove()
    strictEqual(list.first, undefined)
    strictEqual(list.last, undefined)
    list.addLast(false).remove()
    strictEqual(list.first, undefined)
    strictEqual(list.last, undefined)
})
test('removing one of two nodes makes other node both first and last', 4, function() {
    var list = new LinkedList()
    var nodeA = list.addFirst(123)
    var nodeB = list.addLast(456)
    nodeB.remove()
    strictEqual(list.getFirstNode(), nodeA)
    strictEqual(list.getLastNode(), nodeA)
    nodeB = list.addFirst(789)
    nodeB.remove()
    strictEqual(list.getFirstNode(), nodeA)
    strictEqual(list.getLastNode(), nodeA)
})
test('removing a node twice', 0, function() {
    var list = new LinkedList()
    var node = list.addFirst({})
    node.remove()
    node.remove()
})
test('clear list', function() {
    var list = new LinkedList()
    list.addLast(1)
    list.addLast(2)
    list.addLast(3)
    list.clear()
    strictEqual(list.head.next, list.tail)
})
test('test whether empty', function() {
    var list = new LinkedList()
    strictEqual(list.empty, true)
    var a = list.addLast(1)
    strictEqual(list.empty, false)
    a.remove()
    strictEqual(list.empty, true)
})
test('multiple removals without breaking iteration', 0, function() {
    var list = new LinkedList()
    list.forEach(function() {})
    list.addLast(1)
    var node = list.addLast(2)
    list.addLast(3)
    list.forEach(function() {})
    node.remove()
    list.forEach(function() {})
    node.remove()
    list.forEach(function() {})
})
test('consistency of list after removal', function() {
    var list = new LinkedList()
    function impl() {
        var nodeA = list.addLast(1)
        var nodeB = list.addLast(2)
        var nodeC = list.addLast(3)

        strictEqual(nodeA.next, nodeB)
        strictEqual(nodeB.prev, nodeA)
        strictEqual(nodeB.next, nodeC)
        strictEqual(nodeC.prev, nodeB)

        nodeB.remove()

        strictEqual(nodeA.next, nodeC)
        strictEqual(nodeC.prev, nodeA)
        //strictEqual(nodeB.prev, undefined)
        //strictEqual(nodeB.next, undefined)

        nodeA.remove()
        nodeC.remove()

        strictEqual(list.head.next, list.tail)
        strictEqual(list.tail.prev, list.head)
    }
    impl()
    impl()
})
test('iteration of empty list is no-op', 0, function() {
    var list = new LinkedList()
    list.forEach(fail)
})
test('removals during iteration', function() {
    var list = new LinkedList()
    list.addLast(1)
    list.addLast(2)
    list.addLast(3)
    list.forEachNode(function(node) {
        node.remove()
    })
    strictEqual(list.head.next, list.tail)
    strictEqual(list.tail.prev, list.head)
})
test('removal of consecutive nodes during iteration', function() {
    var list = new LinkedList()
    var nodeA = list.addLast(1)
    var nodeB = list.addLast(2)
    var nodeC = list.addLast(3)

    var impl = function(node) {
        nodeA.remove()
        nodeB.remove()
        impl = function(node) {
            strictEqual(node, nodeC)
        }
    }
    list.forEachNode(function(node) { impl(node) })
    strictEqual(list.head.next, nodeC)
    strictEqual(list.tail.prev, nodeC)
})
test('some(): iterate until returned true', 3, function() {
    var list = new LinkedList()
    list.addLast(function() {
        pass()
        return false
    })
    list.addLast(function() {
        pass()
        return true
    })
    list.addLast(fail)

    strictEqual(
        list.some(function(callMe) { return callMe() }),
        true
    )
})
test('some(): not returning true', 4, function() {
    var list = new LinkedList()
    list.addLast(function() {
        pass()
        return false
    })
    list.addLast(function() {
        pass()
        return false
    })
    list.addLast(function() {
        pass()
        return false
    })

    strictEqual(
        list.some(function(callMe) { return callMe() }),
        false
    )
})
test('compute size', function() {
    var list = new LinkedList()
    strictEqual(list.size, 0)
    list.addLast(1)
    strictEqual(list.size, 1)
    var node = list.addLast('a')
    strictEqual(list.size, 2)
    node.remove()
    strictEqual(list.size, 1)
    list.addLast(true)
    strictEqual(list.size, 2)
    list.clear()
    strictEqual(list.size, 0)
})
test('continuation passing style iteration forward', 4, function() {
    var list = new LinkedList()
    list.addLast(1)
    list.addLast(2)
    list.addLast(3)

    var i = 1
    list.forEach_c(function(element, retroceed, proceed) {
        strictEqual(element, i)
        i += 1
        if(proceed())
            strictEqual(i, 4)
    })
})
test('continuation passing style iteration reverse', 4, function() {
    var list = new LinkedList()
    list.addLast(1)
    list.addLast(2)
    list.addLast(3)

    var i = 3
    list.forEach_reverse_c(function(element, retroceed, proceed) {
        strictEqual(element, i)
        i -= 1
        if(retroceed())
            strictEqual(i, 0)
    })
})
test('reverse iteration', 3, function() {
    var list = new LinkedList()
    list.addFirst(1)
    list.addFirst(2)
    list.addFirst(3)

    var i = 1
    list.forEach_reverse(function(element) {
        strictEqual(element, i)
        i += 1
    })
})
test('consecutive removals without breaking reverse iteration', function() {
    var list = new LinkedList()
    var nodeA = list.addFirst(1)
    var nodeB = list.addFirst(2)
    var nodeC = list.addFirst(3)
    var nodeD = list.addFirst(4)
    var nodeE = list.addFirst(5)

    var i = 1
    list.forEach_reverse(function(element) {
        if(i === 1) {
            strictEqual(element, 1)
            nodeB.remove()
            nodeC.remove()
        }
        else if(i === 2) {
            strictEqual(element, 4)
            nodeD.remove()
        }
        else if(i === 3) {
            strictEqual(element, 5)
        }
        else {
            fail()
        }
        i += 1
    })
})
test('search for element', function() {
    var list = new LinkedList()
    strictEqual(list.strictlyContains(0), false)
    list.addFirst('')
    strictEqual(list.strictlyContains(0), false)
    strictEqual(list.strictlyContains(''), true)
    list.addFirst({})
    strictEqual(list.strictlyContains(0), false)
    strictEqual(list.strictlyContains(''), true)
    strictEqual(list.strictlyContains({}), false)

    var obj = {}
    list.addLast(obj)
    strictEqual(list.strictlyContains(0), false)
    strictEqual(list.strictlyContains(''), true)
    strictEqual(list.strictlyContains({}), false)
    strictEqual(list.strictlyContains(obj), true)
})
