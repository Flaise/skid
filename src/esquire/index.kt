package esquire

/*
 * Assumes exclusive ownership of each removal
 */
fun until(onRemove: dynamic, removals: dynamic) {
    onRemove.listenOnce({
        removals.forEach({ removal: dynamic ->
            if(js("typeof removal === 'function'"))
                removal()
            else
                removal.remove()
        })
    })
}


val emptyRemoval = bind_until({})

fun bind_until(func: dynamic): dynamic {
    var clear: (()->Unit)? = null
    val result: dynamic = {
        if(clear != null) {
            clear!!()
            clear = null
        }
        func()
    }
    result.until = { onRemove: dynamic ->
        if(clear != null)
            throw Exception("More than one call to until()")
        clear = onRemove.listenOnce(result)
    }
    return result
}

native("setInterval")
val setInterval: (()->Unit, Double)->dynamic = noImpl
native("clearInterval")
val clearInterval: (dynamic)->Unit = noImpl

fun setInterval_rm(callback: ()->Unit, delay: Double): ()->Unit {
    val interval = setInterval(callback, delay)
    return bind_until({ clearInterval(interval) })
}

native("setTimeout")
val setTimeout: (()->Unit, Double)->dynamic = noImpl
native("clearTimeout")
val clearTimeout: (dynamic)->Unit = noImpl

fun now(): Int {
    return js("Date.now()")
}

fun setTimeout_rm(callback: ()->Unit, delay: Double): ()->Unit {
    val dest = now() + delay
    var timeout: dynamic

    var execute: ()->Unit
    execute = {
        val newDelay = dest - now()
        if(newDelay > 0)
            timeout = setTimeout(execute, newDelay)
        else {
            timeout = null
            callback()
        }
    }
    timeout = setTimeout(execute, delay)

    return bind_until({
        if(timeout != null)
            clearTimeout(timeout)
    })
}

fun clamp(value: Double, lo: Double, hi: Double): Double {
    return when {
        lo > hi -> clamp(value, hi, lo)
        value < lo -> lo
        value > hi -> hi
        else -> value
    }
}
