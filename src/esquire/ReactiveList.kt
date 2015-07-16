package esquire


class ReactiveListNode<TElement>(private val list: ReactiveList<TElement>,
                                 value: TElement): LinkedListNode<TElement>(value) {
    val onRemove = EventDispatcher<Unit>()

    override fun removeImpl() {
        if(removed)
            return
        super.removeImpl()
        list.size.value -= 1
        list.onRemove(value)
        onRemove()
    }
}

class ReactiveList<TElement> {
    private val head = ReactiveListNode<TElement>(this, null)
    private val tail = ReactiveListNode<TElement>(this, null)

    init {
        head.next = tail
    }

    val size = Reactant(0)
    val onRemove = EventDispatcher<TElement>()
    val onAdd = EventDispatcher<TElement>()
    val onAddNode = EventDispatcher<ReactiveListNode<TElement>>()

    fun addFirst(element: TElement): ReactiveListNode<TElement> {
        val node = ReactiveListNode(this, element)
        head.insertAfter(node)
        size.value += 1
        onAddNode(node)
        onAdd(element)
        return node
    }

    fun addLast(element: TElement): ReactiveListNode<TElement> {
        val node = ReactiveListNode(this, element)
        tail.insertBefore(node)
        size.value += 1
        onAddNode(node)
        onAdd(element)
        return node
    }

    val empty: Boolean
        get() = head.next === tail

    fun clear() {
        head.next = tail
    }

    fun forEach(callback: (TElement)->Unit) = forEachNode { callback(it.value) }

    fun forEachNode(callback: (ReactiveListNode<TElement>)->Unit) {
        var node = head
        while(true) {
            node = node.next!! as ReactiveListNode<TElement>
            if(node === tail)
                return
            if(node.removed)
                continue
            callback(node)
        }
    }

    fun onAddInvoke(callback: (TElement)->Unit): Registration {
        forEach(callback)
        return onAdd.listen(callback)
    }

    fun onAddNodeInvoke(callback: (ReactiveListNode<TElement>)->Unit): Registration {
        forEachNode(callback)
        return onAddNode.listen(callback)
    }
}
