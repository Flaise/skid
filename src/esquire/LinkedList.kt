package esquire

import java.util.*


open class LinkedListNode<TElement>(val value: TElement): Registration {
    var removed = false

    private var _prev: LinkedListNode<TElement>? = null
    var prev: LinkedListNode<TElement>?
        get() = _prev
        set(other) {
            if(_prev != null)
                _prev!!._next = null
            _prev = other
            if(_prev != null) {
                if(_prev!!._next != null)
                    _prev!!._next!!._prev = null
                _prev!!._next = this
            }
        }

    private var _next: LinkedListNode<TElement>? = null
    var next: LinkedListNode<TElement>?
        get() = _next
        set(other) {
            if(_next != null)
                _next!!._prev = null
            _next = other
            if(_next != null) {
                if(_next!!._prev != null)
                    _next!!._prev!!._next = null
                _next!!._prev = this
            }
        }

    fun insertValueAfter(element: TElement): LinkedListNode<TElement> {
        val node = LinkedListNode(element)
        insertAfter(node)
        return node
    }

    fun insertValueBefore(element: TElement): LinkedListNode<TElement> {
        val node = LinkedListNode(element)
        insertBefore(node)
        return node
    }

    fun insertAfter(node: LinkedListNode<TElement>) {
        node.next = next
        node.prev = this
    }

    fun insertBefore(node: LinkedListNode<TElement>) {
        node.prev = prev
        node.next = this
    }

    override fun removeImpl() {
        if(removed)
            return

        val oldPrev = prev
        val oldNext = next
        removed = true
        if(oldPrev != null)
            oldPrev._next = oldNext
        if(oldNext != null)
            oldNext._prev = oldPrev
    }

    override var untilRegistrations: ArrayList<Registration>? = null
}

class LinkedList<TElement> {
    val head = LinkedListNode<TElement>(null)
    val tail = LinkedListNode<TElement>(null)

    init {
        head.next = tail
    }

    fun addFirst(element: TElement) = head.insertValueAfter(element)
    fun addLast(element: TElement) = tail.insertValueBefore(element)

    fun getFirst() = getFirstNode().value
    fun getLast() = getLastNode().value

    fun getFirstNode(): LinkedListNode<TElement> {
        if(empty)
            throw NoSuchElementException()
        return head.next!!
    }

    fun getLastNode(): LinkedListNode<TElement> {
        if(empty)
            throw NoSuchElementException()
        return tail.prev!!
    }

    val empty: Boolean
        get() = head.next === tail

    fun clear() {
        head.next = tail
    }

    fun forEach(callback: (TElement)->Unit) = forEachNode { callback(it.value) }

    fun forEachNode(callback: (LinkedListNode<TElement>)->Unit) {
        var node = head
        while(true) {
            node = node.next!!
            if(node == tail)
                return
            if(node.removed)
                continue
            callback(node)
        }
    }
}
