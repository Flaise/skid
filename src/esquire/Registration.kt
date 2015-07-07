package esquire


interface Registration {
    fun remove()

    fun until(terminant: EventDispatcher<Unit>) {
        var clear: Registration?
        clear = terminant.listenOnce({
            if(clear != null) {
                clear!!.remove()
                clear = null
            }
            remove()
        })
    }
}
