package esquire


class EventDispatcher<TEvent> {
    val callbacks = LinkedList<(TEvent)->Unit>()

    fun listen(callback: (TEvent)->Unit): Registration = callbacks.addFirst(callback)

    fun listenOnce(callback: (TEvent)->Unit): Registration {
        var registration: Registration
        registration = listen({
            registration.remove()
            callback(it)
        })
        return registration
    }

    fun invoke(event: TEvent) = callbacks.forEach { it.invoke(event) }

    fun plus(other: EventDispatcher<TEvent>): EventDispatcher<TEvent> {
        val result = EventDispatcher<TEvent>()

        val registrationA = listen({ result.invoke(it) })
        val registrationB = other.listen({ result.invoke(it) })

        return result
    }

    companion object {
        fun any<T>(vararg dispatchers: EventDispatcher<T>): EventDispatcher<T> {
            if(dispatchers.size() == 0)
                throw IllegalArgumentException()
            var result = dispatchers[0]
            for(i in 1..(dispatchers.size() - 1))
                result += dispatchers[i]
            return result
        }
    }
}
