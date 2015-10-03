"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LinkedListNode = (function () {
    function LinkedListNode(value) {
        _classCallCheck(this, LinkedListNode);

        this.value = value;
        this._next = undefined;
        this._prev = undefined;
        this.removed = false;
    }

    _createClass(LinkedListNode, [{
        key: "insertValueAfter",
        value: function insertValueAfter(value) {
            var node = new LinkedListNode(value);
            this.insertAfter(node);
            return node;
        }
    }, {
        key: "insertValueBefore",
        value: function insertValueBefore(value) {
            var node = new LinkedListNode(value);
            this.insertBefore(node);
            return node;
        }
    }, {
        key: "insertAfter",
        value: function insertAfter(node) {
            node.next = this.next;
            node.prev = this;
        }
    }, {
        key: "insertBefore",
        value: function insertBefore(node) {
            node.prev = this.prev;
            node.next = this;
        }
    }, {
        key: "base_remove",
        value: function base_remove() {
            if (this.removed) return;

            var oldPrev = this.prev;
            var oldNext = this.next;
            this.removed = true;
            if (oldPrev) oldPrev._next = oldNext;
            if (oldNext) oldNext._prev = oldPrev;
        }
    }, {
        key: "remove",
        value: function remove() {
            this.base_remove();
        }
    }, {
        key: "next",
        get: function get() {
            return this._next;
        },
        set: function set(node) {
            if (this._next) this._next._prev = undefined;
            this._next = node;
            if (node) {
                if (node._prev) node._prev._next = undefined;
                node._prev = this;
            }
        }
    }, {
        key: "prev",
        get: function get() {
            return this._prev;
        },
        set: function set(node) {
            if (this._prev) this._prev._next = undefined;
            this._prev = node;
            if (node) {
                if (node._next) node._next._prev = undefined;
                node._next = this;
            }
        }
    }]);

    return LinkedListNode;
})();

exports["default"] = LinkedListNode;
module.exports = exports["default"];
//# sourceMappingURL=linked-list-node.js.map