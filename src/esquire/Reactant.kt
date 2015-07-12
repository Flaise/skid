package esquire


data class Change<T>(val prev: T, val curr: T)

class Reactant<T>(initialValue: T) {
    constructor(initialDefinition: ()->T,
                initialOnMod: EventDispatcher<Unit>? = null): this(initialDefinition()) {
        define(initialDefinition, initialOnMod)
    }

    private var definition: ()->T

    private var definitionReg: Registration? = null

    fun define(definition: ()->T, onMod: EventDispatcher<Unit>? = null) {
        this.definition = definition

        if(definitionReg != null)
            definitionReg!!.remove()

        if(onMod == null)
            definitionReg = null
        else
            definitionReg = onMod.listen { changed() }

        changed()
    }

    var value: T
        get() = definition()
        set(newValue) = define({ newValue })

    private var lastValue: T

    init {
        definition = { initialValue }
        lastValue = value

        js("""Kotlin.modules.esquire.esquire.Reactant.prototype.and =
              function(other) { return Kotlin.modules.esquire.esquire.and(this, other) };""")
        js("""Kotlin.modules.esquire.esquire.Reactant.prototype.or =
              function(other) { return Kotlin.modules.esquire.esquire.or(this, other) };""")
        js("""Kotlin.modules.esquire.esquire.Reactant.prototype.not =
              function() { return Kotlin.modules.esquire.esquire.not(this) };""")

        js("""Kotlin.modules.esquire.esquire.Reactant.prototype.minus =
              function(other) { return Kotlin.modules.esquire.esquire.minus_1(this, other) };""")
        js("""Kotlin.modules.esquire.esquire.Reactant.prototype.plus =
              function(other) { return Kotlin.modules.esquire.esquire.plus(this, other) };""")
        js("""Kotlin.modules.esquire.esquire.Reactant.prototype.div =
              function(other) { return Kotlin.modules.esquire.esquire.div(this, other) };""")
        js("""Kotlin.modules.esquire.esquire.Reactant.prototype.times =
              function(other) { return Kotlin.modules.esquire.esquire.times(this, other) };""")
        js("""Kotlin.modules.esquire.esquire.Reactant.prototype.negative =
              function() { return Kotlin.modules.esquire.esquire.minus(this) };""")
    }

    private var changes = EventDispatcher<Change<T>>()
    private var unitChanges = changes.toUnit()

    private fun changed() {
        val prev = lastValue
        val curr = value
        if(prev == curr)
            return

        // Must be saved here because it might be altered during event propagation
        lastValue = curr

        changes(Change(prev, curr))
    }

    fun listen(callback: (T, T)->Unit) = changes.listen { callback(it.prev, it.curr) }

    fun listenAndInvoke(callback: (T, T)->Unit): Registration {
        val curr = value
        callback(curr, curr)

        return listen(callback)
    }

    fun on(predicate: (T, T)->Boolean): EventDispatcher<Unit> {
        val result = EventDispatcher<Unit>()
        listen { prev, curr ->
            if(predicate(prev, curr))
                result(Unit)
        }
        return result
    }
    fun on(target: T) = on { prev, curr -> curr == target }
    fun onNot(target: T) = on { prev, curr -> curr != target }

    fun depend<U>(other: Reactant<U>, transformation: (U)->T) {
        define({ transformation(other.value) }, other.unitChanges)
    }
    fun echo(other: Reactant<T>) {
        define({ other.value }, other.unitChanges)
    }

    fun compose<U, V>(other: Reactant<U>, transformation: (T, U)->V): Reactant<V> {
        return Reactant<V>({ transformation(this.value, other.value) },
                unitChanges aggregate other.unitChanges)
    }

    fun transform<U>(transformation: (T)->U) = Reactant<U>({ transformation(value) }, unitChanges)

    // TODO
//    companion object {
//        fun tuple<A, B>(a: Reactant<A>, b: Reactant<B>): Reactant<Pair<A, B>> {
//            return Reactant({ Pair(a.value, b.value) }, a.unitChanges aggregate b.unitChanges)
//        }
//        fun tuple<A, B, C>(a: Reactant<A>, b: Reactant<B>, c: Reactant<C>): Reactant<Triple<A, B, C>> {
//            return Reactant({ Triple(a.value, b.value, c.value) },
//                            EventDispatcher.any(a.unitChanges, b.unitChanges, c.unitChanges))
//        }
//    }
}

fun Reactant<Boolean>.and(other: Reactant<Boolean>) = this.compose(other, { a, b -> a and b })
fun Reactant<Boolean>.or(other: Reactant<Boolean>) = this.compose(other, { a, b -> a or b })
fun Reactant<Boolean>.not() = this.transform({ !it })

fun Reactant<Double>.minus() = this.transform({ -it })
fun Reactant<Double>.minus(other: Reactant<Double>) = this.compose(other, { a, b -> a - b })
fun Reactant<Double>.plus(other: Reactant<Double>) = this.compose(other, { a, b -> a + b })
fun Reactant<Double>.times(other: Reactant<Double>) = this.compose(other, { a, b -> a * b })
fun Reactant<Double>.div(other: Reactant<Double>) = this.compose(other, { a, b -> a / b })
