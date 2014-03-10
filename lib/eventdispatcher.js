
function bind_until(func, onUnbindGroup) {
    var clear
    var result = function() {
        if(clear) {
            clear()
            clear = undefined
        }
        func()
    }
    result.until = function(onRemove) {
        // ****************************************** TODO: it may become convenient to allow multiple calls, but that's not really what this function is for right now
        if(clear) throw new Error('more than one call to until')
        if(onUnbindGroup) {
            onRemove.listenOnce(result).until(onUnbindGroup)
            clear = onUnbindGroup.proc.bind(onUnbindGroup)
        }
        else
            clear = onRemove.listenOnce(result)
    }
    return result
}


function EventDispatcher() {
    this.callbacks = new LinkedList()
}
EventDispatcher.prototype.listen = function(callback) {
    if(!callback.apply) throw new Error()
    var node = this.callbacks.addFirst(callback) // it might break some behaviors to call listeners in reverse order, but it allows insertion during iteration
    // if it doesn't work, another test will be added
    return bind_until(node.remove.bind(node))
}
EventDispatcher.prototype.listenOnce = function(callback) {
    if(!callback.apply) throw new Error()
    var remove = this.listen(function listenOnceWrapper(__varargs__) {
        remove() // remove will be initialized by the time this is called because there is no event for 'listener-added'
        callback.apply(null, arguments)
    })
    return remove
}
EventDispatcher.prototype.proc = function(__varargs__) {
    var args = arguments // make visible to foreach body
    this.callbacks.forEach(function eachCallback(callback) {
        callback.apply(null, args)
    })
}
EventDispatcher.prototype.onlyWhen = function(reactant) {
    var result = new EventDispatcher()

    ////////////////////////////////////////////////////// TODO: This listener needs to be removed when result has none of its own listeners, and re-added when it does
    var remove = this.listen(function(__varargs__) {
        if(reactant.value)
            result.proc.apply(result, arguments)
    })

    return result
}
EventDispatcher.prototype.aggregate = function(other) {
    var result = new EventDispatcher()

    ////////////////////////////////////////////////////// TODO: These listeners need to be removed when result has none of its own listeners, and re-added when it does
    var removeA = this.listen(result.proc.bind(result))
    var removeB = other.listen(result.proc.bind(result))

    return result
}

// `predicate` should generally have no side effects.
/*EventDispatcher.prototype.filterEvents = function(predicate) {
	var result = new EventDispatcher()
	
	////////////////////////////////////////////////////// TODO: This listener needs to be removed when result has none of its own listeners, and re-added when it does
	var remove = this.listen(function(__varargs__) {
		if(predicate.apply(null, arguments))
			result.proc.apply(result, arguments)
	})
	
	return result
}*/
