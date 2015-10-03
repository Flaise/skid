'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _linkedList = require('./linked-list');

var _linkedList2 = _interopRequireDefault(_linkedList);

var EventDispatcher = (function () {
    function EventDispatcher() {
        _classCallCheck(this, EventDispatcher);

        this.callbacks = new _linkedList2['default']();
    }

    _createClass(EventDispatcher, [{
        key: 'listen',
        value: function listen(callback) {
            if (!callback.apply) throw new Error();

            // it might break some behaviors to call listeners in reverse order but it allows insertion
            // during iteration
            var node = this.callbacks.addFirst(callback);

            return function () {
                return node.remove();
            };
        }
    }, {
        key: 'listen_pc',
        value: function listen_pc(callback) {
            callback();
            return this.listen(callback);
        }
    }, {
        key: 'listenOnce',
        value: function listenOnce(callback) {
            var _arguments = arguments;

            if (!callback.apply) throw new Error();

            var remove = this.listen(function (__varargs__) {
                // remove will be initialized by the time this closure is called because there is no
                // event for 'listener-added'
                remove();
                callback.apply(null, _arguments);
            });
            return remove;
        }
    }, {
        key: 'proc',
        value: function proc(__varargs__) {
            this.base_proc.apply(this, arguments);
        }
    }, {
        key: 'base_proc',
        value: function base_proc() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            this.callbacks.forEach(function (callback) {
                return callback.apply(null, args);
            });
        }
    }, {
        key: 'filter',
        value: function filter(reactant) {
            var _arguments2 = arguments;

            var result = new EventDispatcher();

            ////////////////////////////////////////////////////// TODO: This listener needs to be removed when result has none of its own listeners, and re-added when it does
            var remove = this.listen(function (__varargs__) {
                if (reactant.value) result.proc.apply(result, _arguments2);
            });

            return result;
        }
    }, {
        key: 'aggregate',
        value: function aggregate(other) {
            var result = new EventDispatcher();

            ////////////////////////////////////////////////////// TODO: These listeners need to be removed when result has none of its own listeners, and re-added when it does
            // using bind() to retain argument list
            var removeA = this.listen(result.proc.bind(result));
            var removeB = other.listen(result.proc.bind(result));

            return result;
        }
    }], [{
        key: 'any',
        value: function any() {
            for (var _len2 = arguments.length, dispatchers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                dispatchers[_key2] = arguments[_key2];
            }

            if (!dispatchers.length) return undefined;
            var result = dispatchers[0];
            for (var i = 1; i < dispatchers.length; i += 1) {
                result = result.aggregate(dispatchers[i]);
            }return result;
        }
    }]);

    return EventDispatcher;
})();

exports['default'] = EventDispatcher;
module.exports = exports['default'];
//# sourceMappingURL=event-dispatcher.js.map