import {remove, copy} from './array'

export default class EventDispatcher {
    constructor() {
        this._callbacks = []
    }
    listen(callback) {
        if(!callback.apply)
            throw new Error()
        
        this._callbacks.push(callback)
        return {
            stop: () => remove(this._callbacks, callback)
            // TODO: until()
        }
    }
    listen_pc(callback) {
        callback()
        return this.listen(callback)
    }
    listenOnce(callback) {
        if(!callback.apply)
            throw new Error()
            
        const registration = this.listen((...args) => {
            registration.stop()
            callback.apply(undefined, args)
        })
        return registration
    }
    proc(...args) {
        const callbacks = copy(this._callbacks)
        for(let i = 0; i < callbacks.length; i += 1)
            callbacks[i].apply(undefined, args)
    }
    filter(reactant) {
        const result = new EventDispatcher()

        ////////////////////////////////////////////////////// TODO: This listener needs to be removed when result has none of its own listeners, and re-added when it does
        const registration = this.listen((...args) => {
            if(reactant.value)
                result.proc(...args)
        })

        return result
    }
    aggregate(other) {
        const result = new EventDispatcher()

        ////////////////////////////////////////////////////// TODO: These listeners need to be removed when result has none of its own listeners, and re-added when it does
        const registrationA = this.listen((...args) => result.proc(...args))
        const registrationB = other.listen((...args) => result.proc(...args))

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
