import LinkedListNode from './linked-list-node'

export default class LinkedList {
    constructor() {
        this.head = new LinkedListNode()
        this.tail = new LinkedListNode()
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
    
    toArray() {
        var result = []
        this.forEach(v => result.push(v))
        return result
    }
    
    toNodeArray() {
        var result = []
        this.forEachNode(node => result.push(node))
        return result
    }
    
    get empty() {
        return this.head.next === this.tail
    }
}
// explicit property definition so it can be overridden
Object.defineProperty(LinkedList.prototype, 'size', {get: function() {
    var result = 0
    this.forEachNode(() => { result += 1 })
    return result
}})
