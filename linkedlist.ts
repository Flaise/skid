'use strict'

class LinkedListNode {
    _next = undefined
    _prev = undefined
    removeUntil = undefined
    removed = false
    
    constructor(public value?) {
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
    remove() {
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


class LinkedList {
    head = new LinkedListNode()
    tail = new LinkedListNode()
    
    constructor() {
        this.head.next = this.tail
        this.head.remove = undefined
        this.tail.remove = undefined
    }
    
    getFirstNode() {
        if(this.head.next === this.tail)
            return undefined
        return this.head.next
    }
    getLastNode() {
        if(this.tail.prev === this.head)
            return undefined
        return this.tail.prev
    }
    addFirst(element) {
        var node = new LinkedListNode(element)
        this.head.insertAfter(node)
        return node
    }
    addLast(element) {
        var node = new LinkedListNode(element)
        this.tail.insertBefore(node)
        return node
    }
    removeFirst() {
        var node = this.head.next
        if(node === this.tail)
            throw new Error()
        node.remove()
        return node.value
    }
    removeLast() {
        var node = this.tail.prev
        if(node === this.head)
            throw new Error()
        node.remove()
        return node.value
    }
    getFirst() {
        return this.head.next.value
    }
    getLast() {
        return this.tail.prev.value
    }
    forEach(func) {
        this.forEachNode(node => func(node.value))
    }
    forEachNode(func) {
        var node = this.head
        while(true) {
            node = node.next
            if(node === this.tail)
                return
            if(node.removed)
                continue
            func(node)
        }
    }
    forEach_reverse(func) {
        this.forEachNode_reverse(node => func(node.value))
    }
    forEachNode_reverse(func) {
        var node = this.tail
        while(true) {
            node = node.prev
            if(node === this.head)
                return
            if(node.removed)
                continue
            func(node)
        }
    }

    /*
     * Iteration in continuation-passing style.
     * This is useful when the passed callback returns without calling one of its continuation
     * parameters, instead storing either or both of the continuation callbacks for use in another
     * stack frame.
     * func takes 3 parameters:
     *   element - The object stored in the list
     *   retroceed - Call this to make func get called again with the previous element and new
     *     continuation functions. Returns true if the head of the list was reached.
     *   proceed - Call this to make func get called again with the next element and new
     *     continuation functions, like retroceed but backwards. Returns true if the tail of the
     *     list was reached.
     */
    forEach_c(func, onEmpty) {
        this.forEachNode_c(((node, retroceed, proceed) => func(node.value, retroceed, proceed)),
                           onEmpty)
    }
    forEach_reverse_c(func, onEmpty) {
        this.forEachNode_reverse_c(((node, retroceed, proceed) => func(node.value, retroceed, proceed)),
                                   onEmpty)
    }
    
    _makeContinuations(node, func) {
        var proceed = () => {
            while(true) {
                node = node.next
                if(node === this.tail)
                    return true
                if(node.removed)
                    continue
                func(node, retroceed, proceed)
                return false
            }
        }
        var retroceed = () => {
            while(true) {
                node = node.prev
                if(node === this.head)
                    return true
                if(node.removed)
                    continue
                func(node, retroceed, proceed)
                return false
            }
        }
        return {
            proceed: proceed,
            retroceed: retroceed
        }
    }
    
    forEachNode_c(func, onEmpty) {
        if(this.empty) {
            onEmpty()
            return
        }
        this._makeContinuations(this.head, func).proceed()
    }
    
    forEachNode_reverse_c(func, onEmpty) {
        if(this.empty) {
            onEmpty()
            return
        }
        this._makeContinuations(this.tail, func).retroceed()
    }

    clear() {
        this.head.next = this.tail
    }

    /*
     * Calls predicate on each element until predicate returns true. Returns whether predicate
     * returned true.
     */
    some(predicate) {
        return this.someNode(node => predicate(node.value))
    }

    /*
     * Calls predicate on each node until predicate returns true. Returns whether predicate returned
     * true.
     */
    someNode(predicate) {
        var node = this.head
        while(true) {
            node = node.next
            if(node === this.tail)
                return false
            if(node.removed)
                continue
            if(predicate(node))
                return true
        }
    }
    
    strictlyContains(element) {
        return this.some(a => a === element)
    }
    
    get empty() {
        return this.head.next === this.tail
    }
    
    get size() {
        var result = 0
        this.forEachNode(() => { result += 1 })
        return result
    }
}

if(typeof module !== 'undefined')
    module.exports = LinkedList
if(typeof window !== 'undefined')
    window['LinkedList'] = LinkedList
