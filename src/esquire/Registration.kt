package esquire

import java.util.*


interface Registration {
    fun remove() {
        if(untilRegistrations != null) {
            untilRegistrations!!.forEach { it.remove() }
            untilRegistrations = null
        }

        removeImpl()
    }
    fun removeImpl()

    var untilRegistrations: ArrayList<Registration>?

    fun until(terminant: EventDispatcher<Unit>) {
        var clear: Registration?
        clear = terminant.listenOnce({
            clear!!.remove()
            remove()
        })

        if(untilRegistrations == null)
            untilRegistrations = arrayListOf(clear!!)
        else
            untilRegistrations!!.add(clear!!)
    }
}


abstract class AbstractRegistration: Registration {
    override var untilRegistrations: ArrayList<Registration>? = null
}


object NullRegistration: AbstractRegistration() {
    override fun removeImpl() { }
}
