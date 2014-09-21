'use strict'

if(typeof require !== 'undefined') {
    var LinkedList_:any = require('./linkedlist')
    var LinkedListNode_:any = require('./linkedlistnode')
    var Reactant_:any = require('./reactant')
    var EventDispatcher_:any = require('./eventdispatcher')
}
else {
    var LinkedList_:any = LinkedList
    var LinkedListNode_:any = LinkedListNode
    var Reactant_:any = Reactant
    var EventDispatcher_:any = EventDispatcher
}

class ReactiveListNode {
    removed
    base_remove
    onRemove
    
    constructor(private list, public value?) {
        LinkedListNode_.call(this, value)
        this.onRemove = new EventDispatcher_()
    }
    remove() {
        if(this.removed)
            return
        this.base_remove()
        this.list.size.value -= 1
        this.list.onRemove.proc(this.value)
        this.onRemove.proc()
    }
}
ReactiveListNode.prototype['__proto__'] = LinkedListNode_.prototype

class ReactiveList {
    size
    head
    tail
    onAdd
    onAddNode
    onRemove
    forEach
    forEachNode

    constructor() {
        LinkedList_.call(this)
        Object.defineProperties(this, {
            size: {value: new Reactant_(0)},
            onAdd: {value: new EventDispatcher_()},
            onAddNode: {value: new EventDispatcher_()},
            onRemove: {value: new EventDispatcher_()}
        })
    }
    
    addFirst(element) {
        var node = new ReactiveListNode(this, element)
        this.head.insertAfter(node)
        this.size.value += 1
        this.onAddNode.proc(node)
        this.onAdd.proc(element)
        return node
    }
    addLast(element) {
        var node = new ReactiveListNode(this, element)
        this.tail.insertBefore(node)
        this.size.value += 1
        this.onAddNode.proc(node)
        this.onAdd.proc(element)
        return node
    }
    
    onAdd_pc(callback) {
        this.forEach(callback)
        return this.onAdd.listen(callback)
    }
    onAddNode_pc(callback) {
        this.forEachNode(callback)
        return this.onAddNode.listen(callback)
    }
}
ReactiveList.prototype['__proto__'] = LinkedList_.prototype

if(typeof module !== 'undefined')
    module.exports = ReactiveList
