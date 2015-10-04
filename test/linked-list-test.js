import assert from 'power-assert'
import LinkedList from '../src/linked-list'
import LinkedListNode from '../src/linked-list-node'

suite('LinkedListNode')

test('sets next node', () => {
    const nodeA = new LinkedListNode('a')
    const nodeB = new LinkedListNode('b')
    const nodeC = new LinkedListNode('c')
    nodeA.next = nodeB
    assert(nodeA.next === nodeB)
    assert(nodeB.prev === nodeA)
    nodeA.next = nodeC
    assert(nodeA.next === nodeC)
    assert(nodeC.prev === nodeA)
    assert(nodeB.prev == null)
})

test('setting prev node', function() {
    var nodeA = new LinkedListNode('a')
    var nodeB = new LinkedListNode('b')
    var nodeC = new LinkedListNode('c')
    nodeA.prev = nodeB
    assert(nodeA.prev === nodeB)
    assert(nodeB.next === nodeA)
    nodeA.prev = nodeC
    assert(nodeA.prev === nodeC)
    assert(nodeC.next === nodeA)
    assert(nodeB.next === undefined)
})


suite('LinkedList')

test('addFirst then getFirst and getLast', function() {
    var list = new LinkedList()
    list.addFirst(1)
    assert(list.getFirst() === 1)
    assert(list.getLast() === 1)
})
test('addLast then getFirst and getLast', function() {
    var list = new LinkedList()
    list.addLast(5)
    assert(list.getFirst() === 5)
    assert(list.getLast() === 5)
})
test('addFirst twice then getFirst and getLast', function() {
    var list = new LinkedList()
    list.addFirst(1)
    list.addFirst(2)
    assert(list.getFirst() === 2)
    assert(list.getLast() === 1)
})
test('addFirst returns a new node with the element', function() {
    var list = new LinkedList()
    assert(list.addFirst('asdf').value === 'asdf')
})
test('removing a node from middle of a list', function() {
    var list = new LinkedList()
    var nodeA = list.addLast(1)
    var nodeB = list.addLast(2)
    var nodeC = list.addLast(3)
    nodeB.remove()
    assert(nodeA.next === nodeC)
    assert(nodeC.prev === nodeA)
})
test('removing only node from a list', function() {
    var list = new LinkedList()
    list.addFirst(true).remove()
    assert(list.first === undefined)
    assert(list.last === undefined)
    list.addLast(false).remove()
    assert(list.first === undefined)
    assert(list.last === undefined)
})
test('removing one of two nodes makes other node both first and last', function() {
    var list = new LinkedList()
    var nodeA = list.addFirst(123)
    var nodeB = list.addLast(456)
    nodeB.remove()
    assert(list.getFirstNode() === nodeA)
    assert(list.getLastNode() === nodeA)
    nodeB = list.addFirst(789)
    nodeB.remove()
    assert(list.getFirstNode() === nodeA)
    assert(list.getLastNode() === nodeA)
})
test('removing a node twice', function() {
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
    assert(list.head.next === list.tail)
})
test('test whether empty', function() {
    var list = new LinkedList()
    assert(list.empty === true)
    var a = list.addLast(1)
    assert(list.empty === false)
    a.remove()
    assert(list.empty === true)
})
test('multiple removals without breaking iteration', function() {
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

        assert(nodeA.next === nodeB)
        assert(nodeB.prev === nodeA)
        assert(nodeB.next === nodeC)
        assert(nodeC.prev === nodeB)

        nodeB.remove()

        assert(nodeA.next === nodeC)
        assert(nodeC.prev === nodeA)
        //assert(nodeB.prev === undefined)
        //assert(nodeB.next === undefined)

        nodeA.remove()
        nodeC.remove()

        assert(list.head.next === list.tail)
        assert(list.tail.prev === list.head)
    }
    impl()
    impl()
})
test('iteration of empty list is no-op', function() {
    var list = new LinkedList()
    list.forEach(assert.fail)
})
test('removals during iteration', function() {
    var list = new LinkedList()
    list.addLast(1)
    list.addLast(2)
    list.addLast(3)
    list.forEachNode(function(node) {
        node.remove()
    })
    assert(list.head.next === list.tail)
    assert(list.tail.prev === list.head)
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
            assert(node === nodeC)
        }
    }
    list.forEachNode(node => impl(node))
    assert(list.head.next === nodeC)
    assert(list.tail.prev === nodeC)
})
test('some(): iterate until returned true', function() {
    var list = new LinkedList()
    list.addLast(function() {
        return false
    })
    list.addLast(function() {
        return true
    })
    list.addLast(assert.fail)

    assert(list.some(callMe => callMe()) === true)
})
test('some(): not returning true', function() {
    var list = new LinkedList()
    list.addLast(function() {
        return false
    })
    list.addLast(function() {
        return false
    })
    list.addLast(function() {
        return false
    })

    assert(list.some(callMe => callMe()) === false)
})
test('compute size', function() {
    var list = new LinkedList()
    assert(list.size === 0)
    list.addLast(1)
    assert(list.size === 1)
    var node = list.addLast('a')
    assert(list.size === 2)
    node.remove()
    assert(list.size === 1)
    list.addLast(true)
    assert(list.size === 2)
    list.clear()
    assert(list.size === 0)
})
test('search for element', function() {
    var list = new LinkedList()
    assert(list.strictlyContains(0) === false)
    list.addFirst('')
    assert(list.strictlyContains(0) === false)
    assert(list.strictlyContains('') === true)
    list.addFirst({})
    assert(list.strictlyContains(0) === false)
    assert(list.strictlyContains('') === true)
    assert(list.strictlyContains({}) === false)

    var obj = {}
    list.addLast(obj)
    assert(list.strictlyContains(0) === false)
    assert(list.strictlyContains('') === true)
    assert(list.strictlyContains({}) === false)
    assert(list.strictlyContains(obj) === true)
})
