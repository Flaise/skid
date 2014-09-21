'use strict'

test('size', 7, function() {
    var list = new ReactiveList()
    list.size.listen(expectMultiSequence([
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 2],
        [2, 1],
        [1, 0]
    ]))
    strictEqual(list.size.value, 0)
    
    var a = list.addFirst(1)
    var b = list.addFirst(-2)
    var c = list.addLast('asdf')
    a.remove()
    b.remove()
    c.remove()
})

test('list add/remove events', 2, function() {
    var list = new ReactiveList()
    list.onAdd.listenOnce(function(r) { strictEqual(r, 'a') })
    list.onRemove.listen(fail).until(list.onAdd)
    
    var a = list.addFirst('a')
    
    list.onAdd.listenOnce(fail)
    list.onRemove.listenOnce(function(r) { strictEqual(r, 'a') })
    
    a.remove()
})

test('node remove event', 3, function() {
    var list = new ReactiveList()
    var node = list.addLast(9)
    node.onRemove.listenOnce(pass)
    node.remove()
    strictEqual(list.size.value, 0)
    node.onRemove.listen(fail)
    node.remove()
    node.remove()
    strictEqual(list.size.value, 0)
})

test('onAdd_pc', 6, function() {
    var list = new ReactiveList()
    
    list.addLast('r')
    list.addLast('i')
    var q = list.addLast(2)
    
    list.onAdd_pc(expectMultiSequence([ ['r'], ['i'], [2], [5], [NaN] ]))
    
    list.addLast(5)
    q.remove()
    list.addLast(NaN)
    
    strictEqual(list.size.value, 4)
})

test('onAddNode_pc', 6, function() {
    var list = new ReactiveList()
    
    list.addLast('r')
    list.addLast('i')
    var q = list.addLast(2)
    
    var expecter = expectMultiSequence([ ['r'], ['i'], [2], [5], [NaN] ])
    
    list.onAddNode_pc(function(node) { expecter(node.value) })
    
    list.addLast(5)
    q.remove()
    list.addLast(NaN)
    
    strictEqual(list.size.value, 4)
})

test('list modified before onAdd', 4, function() {
    var list = new ReactiveList()

    list.onAdd.listen(function(r) {
        strictEqual(r, 'p')
        deepEqual(list.toArray(), ['p'])
    })
    list.onAddNode.listen(function(r) {
        strictEqual(r.value, 'p')
        deepEqual(list.toArray(), ['p'])
    })
    
    list.addLast('p')
})
