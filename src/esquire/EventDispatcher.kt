package esquire


class EventDispatcher<T> {
    val callbacks = LinkedList<(T)->Unit>()

    fun listen(callback: (T)->Unit): Registration = callbacks.addFirst(callback)

    fun listenOnce(callback: (T)->Unit): Registration {
        var registration: Registration
        registration = listen({
            registration.remove()
            callback(it)
        })
        return registration
    }

    fun invoke(event: T) = callbacks.forEach { it.invoke(event) }

    fun aggregate(other: EventDispatcher<T>): EventDispatcher<T> {
        val result = EventDispatcher<T>()

        // TODO: do something with these registrations
        listen({ result.invoke(it) })
        other.listen({ result.invoke(it) })

        return result
    }

    fun transform<U>(transformation: (T)->U): EventDispatcher<U> {
        val result = EventDispatcher<U>()
        listen({ result.invoke(transformation(it)) })
        return result
    }

    fun toUnit() = transform({ })

    companion object {
        fun any<T>(vararg dispatchers: EventDispatcher<T>): EventDispatcher<T> {
            if(dispatchers.size() == 0)
                throw IllegalArgumentException()
            var result = dispatchers[0]
            for(i in 1..(dispatchers.size() - 1))
                result = result aggregate dispatchers[i]
            return result
        }
    }
}

fun EventDispatcher<Unit>.invoke() = this(Unit)
fun <A, B> EventDispatcher<Pair<A, B>>.invoke(a: A, b: B) = this(Pair(a, b))
fun <A, B, C> EventDispatcher<Triple<A, B, C>>.invoke(a: A, b: B, c: C) = this(Triple(a, b, c))
