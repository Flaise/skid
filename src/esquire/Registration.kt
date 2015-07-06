package esquire


interface Registration {
    fun until(target: EventDispatcher<*>)
    fun remove()
}
