export default class LinkedListNode {
    constructor(value) {
        this.value = value
        this._next = undefined
        this._prev = undefined
        this.removed = false
    }
    
    insertValueAfter(value) {
        const node = new LinkedListNode(value)
        this.insertAfter(node)
        return node
    }
    insertValueBefore(value) {
        const node = new LinkedListNode(value)
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
    base_remove() {
        if(this.removed)
            return

        const oldPrev = this.prev
        const oldNext = this.next
        this.removed = true
        if(oldPrev)
            oldPrev._next = oldNext
        if(oldNext)
            oldNext._prev = oldPrev
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
