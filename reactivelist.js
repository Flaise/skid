'use strict';
if (typeof require !== 'undefined') {
    var LinkedList_ = require('./linkedlist');
    var LinkedListNode_ = require('./linkedlistnode');
    var Reactant_ = require('./reactant');
    var EventDispatcher_ = require('./eventdispatcher');
} else {
    var LinkedList_ = LinkedList;
    var LinkedListNode_ = LinkedListNode;
    var Reactant_ = Reactant;
    var EventDispatcher_ = EventDispatcher;
}

var ReactiveListNode = (function () {
    function ReactiveListNode(list, value) {
        this.list = list;
        this.value = value;
        LinkedListNode_.call(this, value);
        this.onRemove = new EventDispatcher_();
    }
    ReactiveListNode.prototype.remove = function () {
        if (this.removed)
            return;
        this.base_remove();
        this.list.size.value -= 1;
        this.list.onRemove.proc(this.value);
        this.onRemove.proc();
    };
    return ReactiveListNode;
})();
ReactiveListNode.prototype['__proto__'] = LinkedListNode_.prototype;

var ReactiveList = (function () {
    function ReactiveList() {
        LinkedList_.call(this);
        Object.defineProperties(this, {
            size: { value: new Reactant_(0) },
            onAdd: { value: new EventDispatcher_() },
            onAddNode: { value: new EventDispatcher_() },
            onRemove: { value: new EventDispatcher_() }
        });
    }
    ReactiveList.prototype.addFirst = function (element) {
        var node = new ReactiveListNode(this, element);
        this.head.insertAfter(node);
        this.size.value += 1;
        this.onAddNode.proc(node);
        this.onAdd.proc(element);
        return node;
    };
    ReactiveList.prototype.addLast = function (element) {
        var node = new ReactiveListNode(this, element);
        this.tail.insertBefore(node);
        this.size.value += 1;
        this.onAddNode.proc(node);
        this.onAdd.proc(element);
        return node;
    };

    ReactiveList.prototype.onAdd_pc = function (callback) {
        this.forEach(callback);
        return this.onAdd.listen(callback);
    };
    ReactiveList.prototype.onAddNode_pc = function (callback) {
        this.forEachNode(callback);
        return this.onAddNode.listen(callback);
    };
    return ReactiveList;
})();
ReactiveList.prototype['__proto__'] = LinkedList_.prototype;

if (typeof module !== 'undefined')
    module.exports = ReactiveList;
//# sourceMappingURL=reactivelist.js.map
