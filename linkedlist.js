'use strict'

function LinkedListNode(element) {
    this.value = element
    this._next = undefined
    this._prev = undefined
    this.removeUntil = undefined
    this.removed = false
}
LinkedListNode.prototype = {
    insertAfter: function(node) {
        node.next = this.next
        node.prev = this
    },
    insertBefore: function(node) {
        node.prev = this.prev
        node.next = this
    },
    until: function(onRemove) {
        if(this.removeUntil) throw new Error('more than one call to until()')
        this.removeUntil = onRemove.listenOnce(this.remove.bind(this))
    },
    remove: function() {
        if(this.removed) return

        var oldPrev = this.prev
        var oldNext = this.next
        this.removed = true
        if(oldPrev) oldPrev._next = oldNext
        if(oldNext) oldNext._prev = oldPrev

        if(this.removeUntil) {
            this.removeUntil()
            this.removeUntil = undefined
        }
    }
}
Object.defineProperties(
    LinkedListNode.prototype, {
        next: {
            get: function() { return this._next },
            set: function(node) {
                if(this._next) this._next._prev = undefined
                this._next = node
                if(node) {
                    if(node._prev) node._prev._next = undefined
                    node._prev = this
                }
            }
        },
        prev: {
            get: function() { return this._prev },
            set: function(node) {
                if(this._prev) this._prev._next = undefined
                this._prev = node
                if(node) {
                    if(node._next) node._next._prev = undefined
                    node._next = this
                }
            }
        }
    }
)


function LinkedList() {
    this.head = new LinkedListNode()
    this.tail = new LinkedListNode()
    this.head.next = this.tail
    this.head.remove = undefined
    this.tail.remove = undefined
}
LinkedList.prototype = {
    getFirstNode: function() {
        if(this.head.next === this.tail)
            return undefined
        return this.head.next
    },
    getLastNode: function() {
        if(this.tail.prev === this.head)
            return undefined
        return this.tail.prev
    },
    addFirst: function(element) {
        var node = new LinkedListNode(element)
        this.head.insertAfter(node)
        return node
    },
    addLast: function(element) {
        var node = new LinkedListNode(element)
        this.tail.insertBefore(node)
        return node
    },
    removeFirst: function() {
        var node = this.head.next
        if(node === this.tail)
            throw new Error()
        node.remove()
        return node.value
    },
    removeLast: function() {
        var node = this.tail.prev
        if(node === this.head)
            throw new Error()
        node.remove()
        return node.value
    },
    getFirst: function() {
        return this.head.next.value
    },
    getLast: function() {
        return this.tail.prev.value
    },
    forEach: function(func) {
        this.forEachNode(function forEach_body(node) { func(node.value) })
    },
    forEachNode: function(func) {
        var node = this.head
        while(true) {
            node = node.next
            if(node === this.tail) return
            if(node.removed) continue
            func(node)
        }
    },
    forEach_reverse: function(func) {
        this.forEachNode_reverse(function forEach_reverse_body(node) { func(node.value) })
    },
    forEachNode_reverse: function(func) {
        var node = this.tail
        while(true) {
            node = node.prev
            if(node === this.head) return
            if(node.removed) continue
            func(node)
        }
    },

    /*
        iteration in continuation-passing style
        This is only useful when the passed callback returns without calling one of its continuation
        parameters, instead storing one for use in another call stack.
        `func` = function(
            element,
            retroceed = function(): bool (true if head was reached),
            proceed = function(): bool (true if tail was reached)
        )
    */
    forEach_c: function(func, onEmpty) {
        this.forEachNode_c(function forEach_c_body(node, retroceed, proceed) {
            func(node.value, retroceed, proceed)
        }, onEmpty)
    },
    forEach_reverse_c: function(func, onEmpty) {
        this.forEachNode_reverse_c(function forEach_reverse_c_body(node, retroceed, proceed) {
            func(node.value, retroceed, proceed)
        }, onEmpty)
    },
    _makeContinuations: function(node, func) {
        var proceed = function() {
            while(true) {
                node = node.next
                if(node === this.tail) return true
                if(node.removed) continue
                func(node, retroceed, proceed)
                return false
            }
        }.bind(this)
        var retroceed = function() {
            while(true) {
                node = node.prev
                if(node === this.head) return true
                if(node.removed) continue
                func(node, retroceed, proceed)
                return false
            }
        }.bind(this)
        return {
            proceed: proceed,
            retroceed: retroceed
        }
    },
    forEachNode_c: function(func, onEmpty) {
        if(this.empty) {
            onEmpty()
            return
        }
        this._makeContinuations(this.head, func).proceed()
    },
    forEachNode_reverse_c: function(func, onEmpty) {
        if(this.empty) {
            onEmpty()
            return
        }
        this._makeContinuations(this.tail, func).retroceed()
    },

    clear: function() {
        this.head.next = this.tail
    },

    /*
     * Calls predicate on each element until predicate returns true. Returns whether predicate returned true.
     */
    some: function(predicate) {
        return this.someNode(function some_body(node) { return predicate(node.value) })
    },

    /*
     * Calls predicate on each node until predicate returns true. Returns whether predicate returned true.
     */
    someNode: function(predicate) {
        var node = this.head
        while(true) {
            node = node.next
            if(node === this.tail) return false
            if(node.removed) continue
            if(predicate(node)) return true
        }
    },
    strictlyContains: function(element) {
        return this.some(function(a) { return a === element })
    }
}
Object.defineProperties(LinkedList.prototype, {
    empty: {get: function() { return this.head.next === this.tail }},
    size: {get: function() {
        var result = 0
        this.forEachNode(function sizeIterator() { result += 1 })
        return result
    }}
})

if(typeof module !== 'undefined') {
    module.exports = LinkedList
}
