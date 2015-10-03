'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _linkedListNode = require('./linked-list-node');

var _linkedListNode2 = _interopRequireDefault(_linkedListNode);

var LinkedList = (function () {
    function LinkedList() {
        _classCallCheck(this, LinkedList);

        this.head = new _linkedListNode2['default']();
        this.tail = new _linkedListNode2['default']();
        this.head.next = this.tail;
        this.head.remove = undefined;
        this.tail.remove = undefined;
    }

    // explicit property definition so it can be overridden

    _createClass(LinkedList, [{
        key: 'getFirstNode',
        value: function getFirstNode() {
            if (this.head.next === this.tail) return undefined;
            return this.head.next;
        }
    }, {
        key: 'getLastNode',
        value: function getLastNode() {
            if (this.tail.prev === this.head) return undefined;
            return this.tail.prev;
        }
    }, {
        key: 'addFirst',
        value: function addFirst(element) {
            var node = new _linkedListNode2['default'](element);
            this.head.insertAfter(node);
            return node;
        }
    }, {
        key: 'addLast',
        value: function addLast(element) {
            var node = new _linkedListNode2['default'](element);
            this.tail.insertBefore(node);
            return node;
        }
    }, {
        key: 'removeFirst',
        value: function removeFirst() {
            var node = this.head.next;
            if (node === this.tail) throw new Error();
            node.remove();
            return node.value;
        }
    }, {
        key: 'removeLast',
        value: function removeLast() {
            var node = this.tail.prev;
            if (node === this.head) throw new Error();
            node.remove();
            return node.value;
        }
    }, {
        key: 'getFirst',
        value: function getFirst() {
            return this.head.next.value;
        }
    }, {
        key: 'getLast',
        value: function getLast() {
            return this.tail.prev.value;
        }
    }, {
        key: 'forEach',
        value: function forEach(func) {
            this.forEachNode(function (node) {
                return func(node.value);
            });
        }
    }, {
        key: 'forEachNode',
        value: function forEachNode(func) {
            var node = this.head;
            while (true) {
                node = node.next;
                if (node === this.tail) return;
                if (node.removed) continue;
                func(node);
            }
        }
    }, {
        key: 'forEach_reverse',
        value: function forEach_reverse(func) {
            this.forEachNode_reverse(function (node) {
                return func(node.value);
            });
        }
    }, {
        key: 'forEachNode_reverse',
        value: function forEachNode_reverse(func) {
            var node = this.tail;
            while (true) {
                node = node.prev;
                if (node === this.head) return;
                if (node.removed) continue;
                func(node);
            }
        }

        /*
         * Iteration in continuation-passing style.
         * This is useful when the passed callback returns without calling one of its continuation
         * parameters, instead storing either or both of the continuation callbacks for use in another
         * stack frame.
         * func takes 3 parameters:
         *   element - The object stored in the list
         *   retroceed - Call this to make func get called again with the previous element and new
         *     continuation functions. Returns true if the head of the list was reached.
         *   proceed - Call this to make func get called again with the next element and new
         *     continuation functions, like retroceed but backwards. Returns true if the tail of the
         *     list was reached.
         */
    }, {
        key: 'forEach_c',
        value: function forEach_c(func, onEmpty) {
            this.forEachNode_c(function (node, retroceed, proceed) {
                return func(node.value, retroceed, proceed);
            }, onEmpty);
        }
    }, {
        key: 'forEach_reverse_c',
        value: function forEach_reverse_c(func, onEmpty) {
            this.forEachNode_reverse_c(function (node, retroceed, proceed) {
                return func(node.value, retroceed, proceed);
            }, onEmpty);
        }
    }, {
        key: '_makeContinuations',
        value: function _makeContinuations(node, func) {
            var _this = this;

            var proceed = function proceed() {
                while (true) {
                    node = node.next;
                    if (node === _this.tail) return true;
                    if (node.removed) continue;
                    func(node, retroceed, proceed);
                    return false;
                }
            };
            var retroceed = function retroceed() {
                while (true) {
                    node = node.prev;
                    if (node === _this.head) return true;
                    if (node.removed) continue;
                    func(node, retroceed, proceed);
                    return false;
                }
            };
            return {
                proceed: proceed,
                retroceed: retroceed
            };
        }
    }, {
        key: 'forEachNode_c',
        value: function forEachNode_c(func, onEmpty) {
            if (this.empty) {
                onEmpty();
                return;
            }
            this._makeContinuations(this.head, func).proceed();
        }
    }, {
        key: 'forEachNode_reverse_c',
        value: function forEachNode_reverse_c(func, onEmpty) {
            if (this.empty) {
                onEmpty();
                return;
            }
            this._makeContinuations(this.tail, func).retroceed();
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.head.next = this.tail;
        }

        /*
         * Calls predicate on each element until predicate returns true. Returns whether predicate
         * returned true.
         */
    }, {
        key: 'some',
        value: function some(predicate) {
            return this.someNode(function (node) {
                return predicate(node.value);
            });
        }

        /*
         * Calls predicate on each node until predicate returns true. Returns whether predicate returned
         * true.
         */
    }, {
        key: 'someNode',
        value: function someNode(predicate) {
            var node = this.head;
            while (true) {
                node = node.next;
                if (node === this.tail) return false;
                if (node.removed) continue;
                if (predicate(node)) return true;
            }
        }
    }, {
        key: 'strictlyContains',
        value: function strictlyContains(element) {
            return this.some(function (a) {
                return a === element;
            });
        }
    }, {
        key: 'toArray',
        value: function toArray() {
            var result = [];
            this.forEach(function (v) {
                return result.push(v);
            });
            return result;
        }
    }, {
        key: 'toNodeArray',
        value: function toNodeArray() {
            var result = [];
            this.forEachNode(function (node) {
                return result.push(node);
            });
            return result;
        }
    }, {
        key: 'empty',
        get: function get() {
            return this.head.next === this.tail;
        }
    }]);

    return LinkedList;
})();

exports['default'] = LinkedList;
Object.defineProperty(LinkedList.prototype, 'size', { get: function get() {
        var result = 0;
        this.forEachNode(function () {
            result += 1;
        });
        return result;
    } });
module.exports = exports['default'];
//# sourceMappingURL=linked-list.js.map