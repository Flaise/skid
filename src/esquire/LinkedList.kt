package esquire


class LinkedListNode<TElement>(val element: TElement) {
    var _prev: LinkedListNode<TElement>? = null
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

    var _next: LinkedListNode<TElement>? = null
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
}

class LinkedList<TElement> {
    fun addFirst(element: TElement) {

    }
}
