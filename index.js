
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

function setInterval_rm(callback, delay) {
    var interval = setInterval(callback, delay)
    return bind_until(function() { clearInterval(interval) })
}
function setTimeout_rm(callback, delay) {
    function execute() {
        var delay = dest - Date.now()
        if(delay > 0)
            timeout = setTimeout(execute, delay)
        else {
            timeout = undefined
            callback()
        }
    }

    var dest = Date.now() + delay
    var timeout = setTimeout(execute, delay)
    return bind_until(function() { if(timeout !== undefined) clearTimeout(timeout) })
}


if(typeof exports !== 'undefined') {
    exports.bind_until = bind_until
    exports.setInterval_rm = setInterval_rm
    exports.setTimeout_rm = setTimeout_rm
}
