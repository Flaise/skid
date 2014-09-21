'use strict';
var LinkedListNode = (function () {
    function LinkedListNode(value) {
        this.value = value;
        this._next = undefined;
        this._prev = undefined;
        this.removeUntil = undefined;
        this.removed = false;
    }
    LinkedListNode.prototype.insertAfter = function (node) {
        node.next = this.next;
        node.prev = this;
    };
    LinkedListNode.prototype.insertBefore = function (node) {
        node.prev = this.prev;
        node.next = this;
    };
    LinkedListNode.prototype.until = function (onRemove) {
        var _this = this;
        if (this.removeUntil)
            throw new Error('more than one call to until()');
        this.removeUntil = onRemove.listenOnce(function () {
            return _this.remove();
        });
    };
    LinkedListNode.prototype.base_remove = function () {
        if (this.removed)
            return;

        var oldPrev = this.prev;
        var oldNext = this.next;
        this.removed = true;
        if (oldPrev)
            oldPrev._next = oldNext;
        if (oldNext)
            oldNext._prev = oldPrev;

        if (this.removeUntil)
            this.removeUntil();
    };
    LinkedListNode.prototype.remove = function () {
        this.base_remove();
    };

    Object.defineProperty(LinkedListNode.prototype, "next", {
        get: function () {
            return this._next;
        },
        set: function (node) {
            if (this._next)
                this._next._prev = undefined;
            this._next = node;
            if (node) {
                if (node._prev)
                    node._prev._next = undefined;
                node._prev = this;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LinkedListNode.prototype, "prev", {
        get: function () {
            return this._prev;
        },
        set: function (node) {
            if (this._prev)
                this._prev._next = undefined;
            this._prev = node;
            if (node) {
                if (node._next)
                    node._next._prev = undefined;
                node._next = this;
            }
        },
        enumerable: true,
        configurable: true
    });
    return LinkedListNode;
})();

if (typeof module !== 'undefined')
    module.exports = LinkedListNode;
//# sourceMappingURL=linkedlistnode.js.map
