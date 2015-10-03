import LinkedList from './linked-list'

export default class EventDispatcher {
    constructor() {
        this.callbacks = new LinkedList()
    }
    listen(callback) {
        if(!callback.apply)
            throw new Error()
        
        // it might break some behaviors to call listeners in reverse order but it allows insertion
        // during iteration
        const node = this.callbacks.addFirst(callback)
        
        return () => node.remove()
    }
    listen_pc(callback) {
        callback()
        return this.listen(callback)
    }
    listenOnce(callback) {
        if(!callback.apply)
            throw new Error()
            
        var remove = this.listen(__varargs__ => {
            // remove will be initialized by the time this closure is called because there is no
            // event for 'listener-added'
            remove()
            callback.apply(null, arguments)
        })
        return remove
    }
    proc(__varargs__?) {
        this.base_proc.apply(this, arguments)
    }
    base_proc(...args) {
        this.callbacks.forEach(callback => callback.apply(null, args))
    }
    filter(reactant) {
        const result = new EventDispatcher()

        ////////////////////////////////////////////////////// TODO: This listener needs to be removed when result has none of its own listeners, and re-added when it does
        const remove = this.listen(__varargs__ => {
            if(reactant.value)
                result.proc.apply(result, arguments)
        })

        return result
    }
    aggregate(other) {
        const result = new EventDispatcher()

        ////////////////////////////////////////////////////// TODO: These listeners need to be removed when result has none of its own listeners, and re-added when it does
        // using bind() to retain argument list
        const removeA = this.listen(result.proc.bind(result))
        const removeB = other.listen(result.proc.bind(result))

        return result
    }
    
    static any(...dispatchers) {
        if(!dispatchers.length)
            return undefined
        let result = dispatchers[0]
        for(let i = 1; i < dispatchers.length; i += 1)
            result = result.aggregate(dispatchers[i])
        return result
    }
}
