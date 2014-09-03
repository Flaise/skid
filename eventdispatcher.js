'use strict';
if (typeof require !== 'undefined') {
    var LinkedList_ = require('./linkedlist');
    var bind_until = require('./index').bind_until;
} else
    var LinkedList_ = LinkedList;

var EventDispatcher = (function () {
    function EventDispatcher() {
        this.callbacks = new LinkedList_();
    }
    EventDispatcher.prototype.listen = function (callback) {
        if (!callback.apply)
            throw new Error();

        // it might break some behaviors to call listeners in reverse order, but it allows insertion
        // during iteration
        var node = this.callbacks.addFirst(callback);

        return bind_until(function () {
            return node.remove();
        });
    };
    EventDispatcher.prototype.listenOnce = function (callback) {
        if (!callback.apply)
            throw new Error();

        var remove = this.listen(function (__varargs__) {
            // remove will be initialized by the time this closure is called because there is no
            // event for 'listener-added'
            remove();
            callback.apply(null, arguments);
        });
        return remove;
    };
    EventDispatcher.prototype.proc = function (__varargs__) {
        this.base_proc.apply(this, arguments);
    };
    EventDispatcher.prototype.base_proc = function (__varargs__) {
        var args = arguments;
        this.callbacks.forEach(function (callback) {
            return callback.apply(null, args);
        });
    };
    EventDispatcher.prototype.onlyWhen = function (reactant) {
        var result = new EventDispatcher();

        ////////////////////////////////////////////////////// TODO: This listener needs to be removed when result has none of its own listeners, and re-added when it does
        var remove = this.listen(function (__varargs__) {
            if (reactant.value)
                result.proc.apply(result, arguments);
        });

        return result;
    };
    EventDispatcher.prototype.aggregate = function (other) {
        var result = new EventDispatcher();

        ////////////////////////////////////////////////////// TODO: These listeners need to be removed when result has none of its own listeners, and re-added when it does
        // using bind() to retain argument list
        var removeA = this.listen(result.proc.bind(result));
        var removeB = other.listen(result.proc.bind(result));

        return result;
    };

    EventDispatcher.any = function () {
        var dispatchers = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            dispatchers[_i] = arguments[_i + 0];
        }
        if (!dispatchers.length)
            return undefined;
        var result = dispatchers[0];
        for (var i = 1; i < dispatchers.length; i += 1)
            result = result.aggregate(dispatchers[i]);
        return result;
    };
    return EventDispatcher;
})();

if (typeof module !== 'undefined')
    module.exports = EventDispatcher;
//# sourceMappingURL=eventdispatcher.js.map
