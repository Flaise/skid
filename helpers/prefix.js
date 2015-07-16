if(process.env.NODE_ENV !== 'browser') {
    // can't use var keyword or minifier shadows Kotlin variable from global scope
    global.Kotlin = require('./kotlin')
}

(function() {
    'use strict'

    if(Kotlin.createClass.patched)
        return

    var baseCreateClass = Kotlin.createClass

    Kotlin.createClass = function(/*varargs*/) {
        var base = baseCreateClass.apply(this, arguments)

        var wrapper = function(/*varargs*/) {
            var result = base.apply(this, arguments)

            Object.keys(result.prototype).forEach(function(key) {
                var groups = /(\w*)_(\w*\$)/.exec(key)
                if(groups)
                    result.prototype[groups[1]] = result.prototype[key]
            })

            return result
        }
        wrapper.type = base.type
        Object.defineProperty(wrapper, 'className', {set: function(a) { base.className = a }})
        return wrapper
    }

    Kotlin.createClass.patched = true
})();

