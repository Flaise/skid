'use strict';
if (typeof require !== 'undefined')
    var LinkedListNode_ = require('./linkedlistnode');
else
    var LinkedListNode_ = LinkedListNode;

var LinkedList = (function () {
    function LinkedList() {
        this.head = new LinkedListNode_();
        this.tail = new LinkedListNode_();
        this.head.next = this.tail;
        this.head.remove = undefined;
        this.tail.remove = undefined;
    }
    LinkedList.prototype.getFirstNode = function () {
        if (this.head.next === this.tail)
            return undefined;
        return this.head.next;
    };
    LinkedList.prototype.getLastNode = function () {
        if (this.tail.prev === this.head)
            return undefined;
        return this.tail.prev;
    };
    LinkedList.prototype.addFirst = function (element) {
        var node = new LinkedListNode_(element);
        this.head.insertAfter(node);
        return node;
    };
    LinkedList.prototype.addLast = function (element) {
        var node = new LinkedListNode_(element);
        this.tail.insertBefore(node);
        return node;
    };
    LinkedList.prototype.removeFirst = function () {
        var node = this.head.next;
        if (node === this.tail)
            throw new Error();
        node.remove();
        return node.value;
    };
    LinkedList.prototype.removeLast = function () {
        var node = this.tail.prev;
        if (node === this.head)
            throw new Error();
        node.remove();
        return node.value;
    };
    LinkedList.prototype.getFirst = function () {
        return this.head.next.value;
    };
    LinkedList.prototype.getLast = function () {
        return this.tail.prev.value;
    };
    LinkedList.prototype.forEach = function (func) {
        this.forEachNode(function (node) {
            return func(node.value);
        });
    };
    LinkedList.prototype.forEachNode = function (func) {
        var node = this.head;
        while (true) {
            node = node.next;
            if (node === this.tail)
                return;
            if (node.removed)
                continue;
            func(node);
        }
    };
    LinkedList.prototype.forEach_reverse = function (func) {
        this.forEachNode_reverse(function (node) {
            return func(node.value);
        });
    };
    LinkedList.prototype.forEachNode_reverse = function (func) {
        var node = this.tail;
        while (true) {
            node = node.prev;
            if (node === this.head)
                return;
            if (node.removed)
                continue;
            func(node);
        }
    };

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
    LinkedList.prototype.forEach_c = function (func, onEmpty) {
        this.forEachNode_c((function (node, retroceed, proceed) {
            return func(node.value, retroceed, proceed);
        }), onEmpty);
    };
    LinkedList.prototype.forEach_reverse_c = function (func, onEmpty) {
        this.forEachNode_reverse_c((function (node, retroceed, proceed) {
            return func(node.value, retroceed, proceed);
        }), onEmpty);
    };

    LinkedList.prototype._makeContinuations = function (node, func) {
        var _this = this;
        var proceed = function () {
            while (true) {
                node = node.next;
                if (node === _this.tail)
                    return true;
                if (node.removed)
                    continue;
                func(node, retroceed, proceed);
                return false;
            }
        };
        var retroceed = function () {
            while (true) {
                node = node.prev;
                if (node === _this.head)
                    return true;
                if (node.removed)
                    continue;
                func(node, retroceed, proceed);
                return false;
            }
        };
        return {
            proceed: proceed,
            retroceed: retroceed
        };
    };

    LinkedList.prototype.forEachNode_c = function (func, onEmpty) {
        if (this.empty) {
            onEmpty();
            return;
        }
        this._makeContinuations(this.head, func).proceed();
    };

    LinkedList.prototype.forEachNode_reverse_c = function (func, onEmpty) {
        if (this.empty) {
            onEmpty();
            return;
        }
        this._makeContinuations(this.tail, func).retroceed();
    };

    LinkedList.prototype.clear = function () {
        this.head.next = this.tail;
    };

    /*
    * Calls predicate on each element until predicate returns true. Returns whether predicate
    * returned true.
    */
    LinkedList.prototype.some = function (predicate) {
        return this.someNode(function (node) {
            return predicate(node.value);
        });
    };

    /*
    * Calls predicate on each node until predicate returns true. Returns whether predicate returned
    * true.
    */
    LinkedList.prototype.someNode = function (predicate) {
        var node = this.head;
        while (true) {
            node = node.next;
            if (node === this.tail)
                return false;
            if (node.removed)
                continue;
            if (predicate(node))
                return true;
        }
    };

    LinkedList.prototype.strictlyContains = function (element) {
        return this.some(function (a) {
            return a === element;
        });
    };

    LinkedList.prototype.toArray = function () {
        var result = [];
        this.forEach(function (v) {
            return result.push(v);
        });
        return result;
    };

    LinkedList.prototype.toNodeArray = function () {
        var result = [];
        this.forEachNode(function (node) {
            return result.push(node);
        });
        return result;
    };

    Object.defineProperty(LinkedList.prototype, "empty", {
        get: function () {
            return this.head.next === this.tail;
        },
        enumerable: true,
        configurable: true
    });
    return LinkedList;
})();

// explicit property definition so it can be overridden
Object.defineProperty(LinkedList.prototype, 'size', { get: function () {
        var result = 0;
        this.forEachNode(function () {
            result += 1;
        });
        return result;
    } });

if (typeof module !== 'undefined')
    module.exports = LinkedList;
//# sourceMappingURL=linkedlist.js.map
