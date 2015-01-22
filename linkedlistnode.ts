'use strict'

class LinkedListNode {
    _next = undefined
    _prev = undefined
    removeUntil = undefined
    removed = false
    
    constructor(public value?) {
    }
    
    insertValueAfter(value) {
        var node = new LinkedListNode(value)
        this.insertAfter(node)
        return node
    }
    insertValueBefore(value) {
        var node = new LinkedListNode(value)
        this.insertBefore(node)
        return node
    }
    
    insertAfter(node) {
        node.next = this.next
        node.prev = this
    }
    insertBefore(node) {
        node.prev = this.prev
        node.next = this
    }
    until(onRemove) {
        if(this.removeUntil)
            throw new Error('more than one call to until()')
        this.removeUntil = onRemove.listenOnce(() => this.remove())
    }
    base_remove() {
        if(this.removed)
            return

        var oldPrev = this.prev
        var oldNext = this.next
        this.removed = true
        if(oldPrev)
            oldPrev._next = oldNext
        if(oldNext)
            oldNext._prev = oldPrev

        if(this.removeUntil)
            this.removeUntil()
    }
    remove() {
        this.base_remove()
    }
    
    get next() {
        return this._next
    }
    set next(node) {
        if(this._next)
            this._next._prev = undefined
        this._next = node
        if(node) {
            if(node._prev)
                node._prev._next = undefined
            node._prev = this
        }
    }
    get prev() {
        return this._prev
    }
    set prev(node) {
        if(this._prev)
            this._prev._next = undefined
        this._prev = node
        if(node) {
            if(node._next)
                node._next._prev = undefined
            node._next = this
        }
    }
}

if(typeof module !== 'undefined')
    module.exports = LinkedListNode
