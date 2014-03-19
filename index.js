
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

if(typeof exports !== 'undefined') {
    exports.bind_until = bind_until
}
