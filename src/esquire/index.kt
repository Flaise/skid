package esquire


native("setInterval")
fun setInterval(callback: ()->Unit, delay: Double): dynamic = noImpl

native("clearInterval")
fun clearInterval(handle: dynamic): Unit = noImpl

fun setIntervalRegistration(callback: ()->Unit, delay: Double): Registration {
    val interval = setInterval(callback, delay)
    return object: AbstractRegistration() {
        override fun removeImpl() = clearInterval(interval)
    }
}

native("setTimeout")
fun setTimeout(callback: ()->Unit, delay: Double): dynamic = noImpl

native("clearTimeout")
fun clearTimeout(handle: dynamic): Unit = noImpl

native("Date.now")
fun now(): Int = noImpl

fun setTimeoutRegistration(callback: ()->Unit, delay: Double): Registration {
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

    return object: AbstractRegistration() {
        override fun removeImpl() {
            if(timeout != null)
                clearTimeout(timeout)
        }
    }
}

fun clamp(value: Double, lo: Double, hi: Double): Double {
    return when {
        lo > hi -> clamp(value, hi, lo)
        value < lo -> lo
        value > hi -> hi
        else -> value
    }
}
