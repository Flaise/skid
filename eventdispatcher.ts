'use strict'

if(typeof require !== 'undefined') {
    var LinkedList_:any = require('./linkedlist')
    var bind_until = require('./index').bind_until
}
else
    var LinkedList_:any = LinkedList

class EventDispatcher {
    callbacks = new LinkedList_()
    
    constructor() {
    }
    listen(callback) {
        if(!callback.apply)
            throw new Error()
        
        // it might break some behaviors to call listeners in reverse order, but it allows insertion
        // during iteration
        var node = this.callbacks.addFirst(callback)
        
        return bind_until(() => node.remove())
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
        var args = arguments // make visible to foreach body
        this.callbacks.forEach(callback => callback.apply(null, args))
    }
    onlyWhen(reactant) {
        var result = new EventDispatcher()

        ////////////////////////////////////////////////////// TODO: This listener needs to be removed when result has none of its own listeners, and re-added when it does
        var remove = this.listen(__varargs__ => {
            if(reactant.value)
                result.proc.apply(result, arguments)
        })

        return result
    }
    aggregate(other) {
        var result = new EventDispatcher()

        ////////////////////////////////////////////////////// TODO: These listeners need to be removed when result has none of its own listeners, and re-added when it does
        // using bind() to retain argument list
        var removeA = this.listen(result.proc.bind(result))
        var removeB = other.listen(result.proc.bind(result))

        return result
    }
}

if(typeof module !== 'undefined')
    module.exports = EventDispatcher
if(typeof window !== 'undefined')
    window['EventDispatcher'] = EventDispatcher
