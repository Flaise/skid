(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var sanity = require('./sanity') // TODO: factor into external library
var is = require('./is')


function Avatar(avatars) {
    this._layer = undefined
    sanity.constant(this, '_node', avatars.alive.addLast(this))
    
    if(sanity.throws)
        this._avatars = avatars
}
module.exports = exports = Avatar

Object.defineProperty(Avatar.prototype, 'layer', {
    get: function() { return this._layer },
    set: function(value) {
        sanity(!(this._avatars && this._avatars._iterating))
        if(sanity(is.number(value)))
            return
        if(value === this._layer)
            return
        this._layer = value
        this._shift()
    }
})

Avatar.prototype._shift = function() {
    if(sanity(!this.removed))
        return
    while(true) {
        var prev = this._node.prev
        var prev_prev = prev.prev
        var next = this._node.next
        
        if(!prev.value)
            break
        if(is.defined(prev.value._layer) && prev.value._layer <= this._layer)
            break
        
        prev.next = next
        prev_prev.next = this._node
        prev.prev = this._node
    }
    
    while(true) {
        var prev = this._node.prev
        var next = this._node.next
        var next_next = next.next
        
        if(!next.value)
            break
        if(is.nullish(next.value._layer) || next.value._layer >= this._layer)
            break
        
        next.prev = prev
        next_next.prev = this._node
        next.next = this._node
    }
}

Object.defineProperty(Avatar.prototype, 'removed', {get: function() { return this._node.removed }})

Avatar.prototype._avatar_remove = function() {
    this._node.remove()
}
Avatar.prototype.remove = Avatar.prototype._avatar_remove

Avatar.prototype.draw = function _abstract() {
    sanity(false)
}

},{"./is":7,"./sanity":11}],2:[function(require,module,exports){
'use strict'

var sanity = require('./sanity')
var Interpolands = require('./interpolands')
var LinkedList = require('./linkedlist')


function Avatars(interpolands) {
    if(sanity(interpolands))
        interpolands = new Interpolands()
    this.interpolands = interpolands
    this.alive = new LinkedList()
}
module.exports = exports = Avatars

Avatars.prototype.draw = function(context) {
    this.alive.forEach(function(avatar) {
        avatar.draw(context)
    })
}


},{"./interpolands":6,"./linkedlist":8,"./sanity":11}],3:[function(require,module,exports){
'use strict'

var sanity = require('./sanity')
var Avatar = require('./avatar')
var EventDispatcher = require('./eventdispatcher')
var is = require('./is')
var esquire = require('./index')
var turns = require('./turns')


function DefaultAvatar(avatars) {
    Avatar.call(this, avatars)
    sanity.constants(this, {
        _interpolands: avatars.interpolands,
        x: avatars.interpolands.make(0),
        y: avatars.interpolands.make(0),
        w: avatars.interpolands.make(0),
        h: avatars.interpolands.make(0),
        angle: avatars.interpolands.make(0),
        opacity: avatars.interpolands.make(1)
    })
}
DefaultAvatar.prototype = Object.create(Avatar.prototype)
module.exports = exports = DefaultAvatar

DefaultAvatar.prototype.doTransform = function(context) {
    if(this.x.curr || this.y.curr)
        context.translate(this.x.curr, this.y.curr)
    if(this.angle.curr)
        context.rotate(turns.toRadians(this.angle.curr))
    // can't scale here; it breaks radii and strokes
    context.globalAlpha = esquire.clamp(this.opacity.curr, 0, 1)
}

DefaultAvatar.prototype._defaultAvatar_remove = function() {
    if(this.removed)
        return
    this._interpolands.remove([this.x, this.y, this.w, this.h, this.angle, this.opacity])
    Avatar.prototype.remove.call(this)
}
DefaultAvatar.prototype.remove = DefaultAvatar.prototype._defaultAvatar_remove

},{"./avatar":1,"./eventdispatcher":4,"./index":5,"./is":7,"./sanity":11,"./turns":18}],4:[function(require,module,exports){
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

        // it might break some behaviors to call listeners in reverse order but it allows insertion
        // during iteration
        var node = this.callbacks.addFirst(callback);

        return bind_until(function () {
            return node.remove();
        });
    };
    EventDispatcher.prototype.listen_pc = function (callback) {
        callback();
        return this.listen(callback);
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
    EventDispatcher.prototype.base_proc = function () {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
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

},{"./index":5,"./linkedlist":8}],5:[function(require,module,exports){
'use strict'


/*
 * Assumes exclusive ownership of each removal
 */
function until(onRemove, removals) {
    onRemove.listenOnce(function() {
        removals.forEach(function(removal) {
            if(typeof removal === 'function')
                removal()
            else
                removal.remove()
        })
    })
}

function emptyRemoval() {}
emptyRemoval.until = function() {}

function bind_until(func) {
    var clear
    var result = function func_with_until() {
        if(clear) {
            clear()
            clear = undefined
        }
        func()
    }
    result.until = function until(onRemove) {
        // ****************************************** TODO: it may become convenient to allow multiple calls but that's not really what this function is for right now
        if(clear)
            throw new Error('more than one call to until')
        clear = onRemove.listenOnce(result)
    }
    return result
}

function setInterval_rm(callback, delay) {
    var interval = setInterval(callback, delay)
    return bind_until(function() { clearInterval(interval) })
}
function setTimeout_rm(callback, delay) {
    if(isNaN(delay))
        throw new Error()
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


exports.clamp = function(value, lo, hi) {
    if(lo > hi) return clamp(value, hi, lo)
    if(value < lo) return lo
    if(value > hi) return hi
    return value
}


if(typeof exports !== 'undefined') {
    exports.bind_until = bind_until
    exports.setInterval_rm = setInterval_rm
    exports.setTimeout_rm = setTimeout_rm
    exports.until = until
    exports.emptyRemoval = emptyRemoval
}

},{}],6:[function(require,module,exports){
'use strict'

var ObjectPool = require('./object-pool')
var sanity = require('./sanity')
var is = require('./is')


function Interpoland(tweens, value) {
    value = value || 0
    this.curr = value
    this.base = value
    this.dest = value
    this.tweens = tweens
}
Interpoland.prototype.mod = function(delta, duration, tweenFunc, onDone, remainder) {
    this.dest += delta
    return this.tweens.make(this, delta, duration, tweenFunc, onDone, remainder, delta)
}
Interpoland.prototype.modTo = function(dest, duration, tweenFunc, onDone, remainder) {
    return this.mod(dest - this.dest, duration, tweenFunc, onDone, remainder)
}
Interpoland.prototype.modNow = function(delta) {
    this.base += delta
    this.curr += delta
    this.dest += delta
}
Interpoland.prototype.modToNow = function(dest) {
    this.modNow(dest - this.dest)
}
Interpoland.prototype.setTo = function(dest) {
    this.base = dest
    this.curr = dest
    this.dest = dest
    this.tweens.removeInterpolands([this])
}
Interpoland.prototype.setToInitial = function(dest) {
    this.base = dest
    this.curr = dest
    this.dest = dest
}
Interpoland.prototype.mod_noDelta = function(amplitude, duration, tweenFunc, onDone, remainder) {
    return this.tweens.make(this, 0, duration, tweenFunc, onDone, remainder, amplitude)
}
sanity.noAccess(Interpoland.prototype, 'value')



function Interpolands() {
    ObjectPool.call(this, Interpoland)
    
    this.tweens = new Tweens()
}
Interpolands.prototype = Object.create(ObjectPool.prototype)

Interpolands.prototype.setTo = function(interpolands, dest) {
    for(var i = 0; i < interpolands.length; i += 1) {
        var interpoland = interpolands[i]
        interpoland.base = dest
        interpoland.curr = dest
        interpoland.dest = dest
    }
    this.tweens.removeInterpolands(interpolands)
}
Interpolands.prototype.setToMany = function(interpolands, dests) {
    for(var i = 0; i < interpolands.length; i += 1) {
        var interpoland = interpolands[i]
        var dest = dests[i]
        interpoland.base = dest
        interpoland.curr = dest
        interpoland.dest = dest
    }
    this.tweens.removeInterpolands(interpolands)
}


Interpolands.prototype.make = function(value) {
    return ObjectPool.prototype.make.call(this, this.tweens, value)
}
Interpolands.prototype.remove = function(removals) {
    ObjectPool.prototype.remove.call(this, removals)
    this.tweens.removeInterpolands(removals)
}

Interpolands.prototype.update = function(dt) {
    for(var i = 0; i < this.aliveCount; i += 1) {
        var interpoland = this.alive[i]
        interpoland.curr = interpoland.base
    }
    this.tweens.update(dt)
}

Interpolands.prototype.clear = function() {
    ObjectPool.prototype.clear.call(this)
    this.tweens.clear()
}

module.exports = exports = Interpolands



function Tween(interpoland, dest, duration, func, onDone, remainder, amplitude) {
    if(sanity(is.number(dest)))
        dest = 0
    if(sanity(is.number(amplitude)))
        amplitude = dest
    
    this.interpoland = interpoland
    this.curr = 0
    this.elapsed = remainder || 0
    this.dest = dest
    this.duration = duration
    this.func = func
    this.onDone = onDone
    this.amplitude = amplitude
}



function Tweens() {
    ObjectPool.call(this, Tween)
    this.ending = []
}
Tweens.prototype = Object.create(ObjectPool.prototype)

Tweens.prototype.removeInterpolands = function(removals) {
    var shiftBy = 0
    var initialCount = this.aliveCount
    for(var i = 0; i < initialCount; i += 1) {
        var tween = this.alive[i]
        
        var deleting = false
        for(var j = 0; j < removals.length; j += 1) {
            if(removals[j] === tween.interpoland) {
                deleting = true
                break
            }
        }
        
        if(deleting) {
            this.dead[this.deadCount] = tween
            this.deadCount += 1
            shiftBy += 1
        }
        else if(shiftBy && i - shiftBy >= 0)
            this.alive[i - shiftBy] = tween
    }
    this.aliveCount -= shiftBy
}
Tweens.prototype.update = function(dt) {
    var endingCount = 0
    var shiftBy = 0
    for(var i = 0; i < this.aliveCount; i += 1) {
        var tween = this.alive[i]
        tween.elapsed += dt
        
        if(tween.elapsed >= tween.duration) {
            shiftBy += 1
            
            if(tween.onDone) {
                this.ending[endingCount] = tween
                endingCount += 1
            }
            else {
                this.dead[this.deadCount] = tween
                this.deadCount += 1
            }
            
            tween.interpoland.curr += tween.dest
            tween.interpoland.base += tween.dest
        }
        else {
            tween.interpoland.curr += tween.amplitude * tween.func(tween.elapsed / tween.duration)

            if(shiftBy && i - shiftBy >= 0)
                this.alive[i - shiftBy] = tween
        }
    }
    this.aliveCount -= shiftBy
    for(var i = 0; i < endingCount; i += 1) {
        var tween = this.ending[i]
        tween.onDone(tween.elapsed - tween.duration)
        tween.onDone = undefined
        this.dead[this.deadCount] = tween
        this.deadCount += 1
    }
}


},{"./is":7,"./object-pool":10,"./sanity":11}],7:[function(require,module,exports){
'use strict'

var funcs = {}

funcs.number = function(a) {
    return (typeof a === 'number') && a !== Infinity && !isNaN(a)
}

funcs.defined = function(a) {
    return a != null
}

funcs.nullish = function(a) {
    return a == null
}

funcs.integer = function(a) {
    return a === Math.floor(a)
}

funcs.boolean = function(a) {
    return !!a === a
}

funcs.func = function(a) {
    return typeof a === 'function'
}

funcs.object = function(a) {
    return !!a && typeof a === 'object'
}

function composeOr(r, s) {
    return addCompositorsTo(function(a) {
        return r(a) || s(a)
    })
}

function makeCompositions(func, compositor) {
    var result = {}
    for(var key in funcs)
        (function(key) {
            Object.defineProperty(result, key, {get: function() {
                return compositor(func, funcs[key])
            }})
        })(key)
    return result
}

function addCompositorsTo(func) {
    func.or = makeCompositions(func, composeOr)
    return func
}
for(var key in funcs)
    addCompositorsTo(funcs[key])

module.exports = funcs

},{}],8:[function(require,module,exports){
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

},{"./linkedlistnode":9}],9:[function(require,module,exports){
'use strict';
var LinkedListNode = (function () {
    function LinkedListNode(value) {
        this.value = value;
        this._next = undefined;
        this._prev = undefined;
        this.removeUntil = undefined;
        this.removed = false;
    }
    LinkedListNode.prototype.insertValueAfter = function (value) {
        var node = new LinkedListNode(value);
        this.insertAfter(node);
        return node;
    };
    LinkedListNode.prototype.insertValueBefore = function (value) {
        var node = new LinkedListNode(value);
        this.insertBefore(node);
        return node;
    };

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

},{}],10:[function(require,module,exports){
'use strict'

var sanity = require('./sanity')


function ObjectPool(constructor) {
    this.constructor = constructor
    this.alive = []
    this.dead = []
    this.aliveCount = 0
    this.deadCount = 0
    this._iterating = false
}
module.exports = exports = ObjectPool

ObjectPool.prototype.make = function(/*varargs*/) {
    sanity(!this._iterating)
    if(this.deadCount) {
        if(sanity.throws) {
            for(var i = 0; i < this.aliveCount; i += 1) {
                sanity(this.dead[this.deadCount - 1] !== this.alive[i])
            }
        }
        this.deadCount -= 1
        var obj = this.dead[this.deadCount]
        sanity(!obj._doNotDelete)
        this.constructor.apply(obj, arguments)
        if(sanity.throws)
            this.dead[this.deadCount] = undefined
    }
    else {
        var obj = Object.create(this.constructor.prototype)
        this.constructor.apply(obj, arguments)
    }
    
    this.alive[this.aliveCount] = obj
    this.aliveCount += 1
    return obj
}
ObjectPool.prototype.clear = function() {
    sanity(!this._iterating)
    var initialCount = this.aliveCount
    for(var i = 0; i < initialCount; i += 1) {
        var obj = this.alive[i]
        if(sanity.throws && obj._doNotDelete)
            continue ////////////////////////////////////// TODO
        this.dead[this.deadCount] = obj
        this.deadCount += 1
    }
    this.aliveCount = 0
}
ObjectPool.prototype.remove = function(removals) {
    if(sanity.throws)
        for(var i = 0; i < removals.length; i += 1)
            sanity(!removals[i]._doNotDelete)
    sanity(!this._iterating)
    var shiftBy = 0
    var initialCount = this.aliveCount
    for(var i = 0; i < initialCount; i += 1) {
        var obj = this.alive[i]
        
        var deleting = false
        if(shiftBy < removals.length)
            for(var j = 0; j < removals.length; j += 1) {
                if(removals[j] === obj) {
                    deleting = true
                    break
                }
            }

        if(deleting) {
            this.dead[this.deadCount] = obj
            this.deadCount += 1
            shiftBy += 1
        }
        else if(shiftBy && i - shiftBy >= 0)
            this.alive[i - shiftBy] = obj
    }
    this.aliveCount -= shiftBy
    sanity(shiftBy === removals.length)
}
ObjectPool.prototype.removeAt = function(index) {
    sanity(!this.alive[index]._doNotDelete)
    sanity(!this._iterating)
    this.dead[this.deadCount] = this.alive[index]
    this.deadCount += 1
    
    var initialCount = this.aliveCount
    for(var i = index + 1; i < initialCount; i += 1) {
        var obj = this.alive[i]
        this.alive[i - 1] = obj
    }
    this.aliveCount -= 1
}

},{"./sanity":11}],11:[function(require,module,exports){
'use strict'

/*
Usage:

if(sanity(a)) {
    ...; // a kludge that will keep the program from crashing
}
...; // the code that always executes
 */
module.exports = exports = function(arg) {
    arg = !arg
    if(exports.throws) {
        if(arg)
            throw new Error()
    }
    return arg
}

/*
 * If true, sanity(false) throws
 * If false, sanity(false) returns true
 */
exports.throws = false

exports.attribute = function(obj, key, value, validator) {
    if(exports.throws) {
        if(!validator)
            throw new Error()
        Object.defineProperty(obj, key, {
            get: function() { return value },
            set: function(newValue) {
                if(!validator(newValue))
                    throw new Error()
                value = newValue
            }
        })
    }
    else {
        obj[key] = initialValue
    }
}
exports.attributes = function(obj, values, validator) {
    if(exports.throws) {
        if(typeof values === 'string'
                || !validator)
            throw new Error()
        for(var key in values)
            exports.attribute(obj, key, values[key], validator)
    }
    else {
        if(typeof initialValues === 'string')
            exports.attribute.apply(undefined, arguments)
        else
            for(var key in values)
                obj[key] = values[key]
    }
}

exports.constants = function(obj, values) {
    if(exports.throws) {
        if(typeof initialValues === 'string')
            throw new Error()
        for(var key in values)
            Object.defineProperty(obj, key, {value: values[key], writable: false})
    }
    else {
        if(typeof values === 'string')
            exports.constant.apply(undefined, arguments)
        else
            for(var key in values)
                obj[key] = values[key]
    }
}
exports.constant = function(obj, key, value) {
    if(exports.throws)
        Object.defineProperty(obj, key, {value: value, writable: false})
    else
        obj[key] = value
}

function raise() {
    throw new Error()
}

exports.noAccess = function(obj, keys) {
    if(!exports.throws)
        return
    if(!keys.forEach)
        return exports.noAccess(obj, [keys])
    keys.forEach(function(key) {
        Object.defineProperty(obj, key, {get: raise, set: raise})
    })
}


},{}],12:[function(require,module,exports){
'use strict'

var Avatars = require('../avatars')
var Interpolands = require('../interpolands')
var DefaultAvatar = require('../default-avatar')


describe('Avatar', function() {
    var avatars
    beforeEach(function() {
        avatars = new Avatars(new Interpolands())
    })
    
    it('does not sort new avatars', function() {
        var a = new DefaultAvatar(avatars)
        expect(a.layer).toBe(undefined)
        
        a.layer = 10
        expect(a.layer).toBe(10)
        
        var b = new DefaultAvatar(avatars)
        expect(b.layer).toBe(undefined)
        expect(a.layer).toBe(10)
        expect(avatars.alive.toArray()[0]).toBe(a)
        expect(avatars.alive.toArray()[1]).toBe(b)
    })
    
    it('sorts avatars ascendingly', function() {
        var a = new DefaultAvatar(avatars)
        a.layer = 10
        
        var b = new DefaultAvatar(avatars)
        b.layer = 2
        
        expect(avatars.alive.toArray()[0]).toBe(b)
        expect(avatars.alive.toArray()[1]).toBe(a)
        expect(avatars.alive.size).toBe(2)
        
        b.layer = 11
        expect(avatars.alive.toArray()[0]).toBe(a)
        expect(avatars.alive.toArray()[1]).toBe(b)
        expect(avatars.alive.size).toBe(2)
    })
    
    it('sorts past avatars of undefined layer', function() {
        var a = new DefaultAvatar(avatars)
        a.layer = 9
        var b = new DefaultAvatar(avatars)
        var c = new DefaultAvatar(avatars)
        expect(avatars.alive.toArray()[0]).toBe(a)
        expect(avatars.alive.toArray()[1]).toBe(b)
        expect(avatars.alive.toArray()[2]).toBe(c)
        
        c.layer = 7
        expect(avatars.alive.toArray()[0]).toBe(c)
        expect(avatars.alive.toArray()[1]).toBe(a)
        expect(avatars.alive.toArray()[2]).toBe(b)
    })
    
    it('sorts many avatars', function() {
        var a = new DefaultAvatar(avatars)
        a.layer = 1.001
        var b = new DefaultAvatar(avatars)
        b.layer = 999
        var c = new DefaultAvatar(avatars)
        c.layer = 1.001
        var d = new DefaultAvatar(avatars)
        d.layer = 1
        var e = new DefaultAvatar(avatars)
        e.layer = 5
        var f = new DefaultAvatar(avatars)
        f.layer = -2
        var g = new DefaultAvatar(avatars)
        g.layer = -2.1
        var h = new DefaultAvatar(avatars)
        var i = new DefaultAvatar(avatars)
        i.layer = -1
        h.layer = 4

        expect(avatars.alive.toArray()[0]).toBe(g)
        expect(avatars.alive.toArray()[1]).toBe(f)
        expect(avatars.alive.toArray()[2]).toBe(i)
        expect(avatars.alive.toArray()[3]).toBe(d)
        expect(avatars.alive.toArray()[4]).toBe(a)
        expect(avatars.alive.toArray()[5]).toBe(c)
        expect(avatars.alive.toArray()[6]).toBe(h)
        expect(avatars.alive.toArray()[7]).toBe(e)
        expect(avatars.alive.toArray()[8]).toBe(b)
        
        a.layer = 4
        b.layer = 7
        c.layer = -.01
        d.layer = -1
        e.layer = 3.999
        f.layer = 3.9999999
        g.layer = 8
        h.layer = 0
        i.layer = 4

        expect(avatars.alive.toArray()[0]).toBe(d)
        expect(avatars.alive.toArray()[1]).toBe(c)
        expect(avatars.alive.toArray()[2]).toBe(h)
        expect(avatars.alive.toArray()[3]).toBe(e)
        expect(avatars.alive.toArray()[4]).toBe(f)
        expect(avatars.alive.toArray()[5]).toBe(i)
        expect(avatars.alive.toArray()[6]).toBe(a)
        expect(avatars.alive.toArray()[7]).toBe(b)
        expect(avatars.alive.toArray()[8]).toBe(g)
    })
    
    it('draws all avatars in order', function() {
        var context = {}
        var i = 0
        
        var a = new DefaultAvatar(avatars)
        a.layer = 4
        var b = new DefaultAvatar(avatars)
        b.layer = 3
        a.draw = jasmine.createSpy('drawA').and.callFake(function(contextArg) {
            expect(contextArg).toBe(context)
            expect(i).toBe(1)
            i += 1
        })
        b.draw = jasmine.createSpy('drawB').and.callFake(function(contextArg) {
            expect(contextArg).toBe(context)
            expect(i).toBe(0)
            i += 1
        })
        
        expect(avatars.alive.toArray()[0]).toBe(b)
        expect(avatars.alive.toArray()[1]).toBe(a)
        
        avatars.draw(context)
        expect(a.draw).toHaveBeenCalled()
        expect(b.draw).toHaveBeenCalled()
    })
    
    it('leaves no interpolands behind after removal', function() {
        new DefaultAvatar(avatars).remove()
        expect(avatars.alive.size).toBe(0)
        expect(avatars.interpolands.aliveCount).toBe(0)
    })
    
    it('leaves no interpolands behind after multi-removal and calls all onRemoves', function() {
        var a = new DefaultAvatar(avatars)
        var b = new DefaultAvatar(avatars)
        var c = new DefaultAvatar(avatars)
        
        a.remove()
        b.remove()
        c.remove()
        expect(avatars.alive.size).toBe(0)
        expect(avatars.interpolands.aliveCount).toBe(0)
    })
    
    it('handles multiple creations and removals', function() {
        var a = new DefaultAvatar(avatars)
        var b = new DefaultAvatar(avatars)
        var c = new DefaultAvatar(avatars)
        var d = new DefaultAvatar(avatars)
        var e = new DefaultAvatar(avatars)
        
        expect(avatars.alive.size).toBe(5)
        expect(avatars.interpolands.aliveCount).toBe(30)
        
        d.remove()
        expect(avatars.alive.toArray()[0]).toBe(a)
        expect(avatars.alive.toArray()[1]).toBe(b)
        expect(avatars.alive.toArray()[2]).toBe(c)
        expect(avatars.alive.toArray()[3]).toBe(e)
        
        expect(avatars.alive.size).toBe(4)
        expect(avatars.interpolands.aliveCount).toBe(24)
        expect(avatars.interpolands.deadCount).toBe(6)
        
        var dx = d
        d = new DefaultAvatar(avatars)
        expect(d).not.toBe(dx)
        expect(avatars.alive.toArray()[3]).toBe(e)
        expect(avatars.alive.toArray()[4]).toBe(d)
        
        a.remove()
        expect(avatars.alive.size).toBe(4)
        expect(avatars.interpolands.aliveCount).toBe(24)
        expect(avatars.interpolands.deadCount).toBe(6)
        expect(avatars.alive.toArray()[0]).toBe(b)
        expect(avatars.alive.toArray()[1]).toBe(c)
        expect(avatars.alive.toArray()[2]).toBe(e)
        expect(avatars.alive.toArray()[3]).toBe(d)
        
        var ax = a
        a = new DefaultAvatar(avatars)
        expect(a).not.toBe(ax)
        expect(avatars.alive.size).toBe(5)
        expect(avatars.interpolands.aliveCount).toBe(30)
        expect(avatars.interpolands.deadCount).toBe(0)
        expect(avatars.alive.toArray()[4]).toBe(a)
        
        c.remove()
        b.remove()
        e.remove()
        expect(avatars.alive.size).toBe(2)
        expect(avatars.interpolands.aliveCount).toBe(12)
        expect(avatars.interpolands.deadCount).toBe(18)
        expect(avatars.alive.toArray()[0]).toBe(d)
        expect(avatars.alive.toArray()[1]).toBe(a)
        
        e = new DefaultAvatar(avatars)
        b = new DefaultAvatar(avatars)
        c = new DefaultAvatar(avatars)
        
        var f = new DefaultAvatar(avatars)
        expect(avatars.alive.size).toBe(6)
        expect(avatars.interpolands.aliveCount).toBe(36)
        expect(avatars.interpolands.deadCount).toBe(0)
        expect(avatars.alive.toArray()[0]).toBe(d)
        expect(avatars.alive.toArray()[1]).toBe(a)
        expect(avatars.alive.toArray()[2]).toBe(e)
        expect(avatars.alive.toArray()[3]).toBe(b)
        expect(avatars.alive.toArray()[4]).toBe(c)
        expect(avatars.alive.toArray()[5]).toBe(f)
    })
    
})

},{"../avatars":2,"../default-avatar":3,"../interpolands":6}],13:[function(require,module,exports){
'use strict'

var Interpolands = require('../interpolands')
var tween = require('../tween')


describe('Interpoland', function() {
    var interpolands
    beforeEach(function() {
        interpolands = new Interpolands()
        expect(interpolands.aliveCount).toBe(0)
        expect(interpolands.tweens.aliveCount).toBe(0)
    })
    afterEach(function() {
        expect(interpolands._iterating).toBeFalsy()
        expect(interpolands.tweens._iterating).toBeFalsy()
    })
    
    it('recycles destroyed interpolands', function() {
        var inter = interpolands.make(0)
        expect(inter.curr).toBe(0)
        expect(interpolands.aliveCount).toBe(1)
        expect(interpolands.deadCount).toBe(0)
        
        interpolands.remove([inter])
        expect(interpolands.aliveCount).toBe(0)
        expect(interpolands.deadCount).toBe(1)
        
        var inter2 = interpolands.make(5)
        expect(inter2).toBe(inter)
        expect(inter2.curr).toBe(5)
        expect(interpolands.aliveCount).toBe(1)
        expect(interpolands.deadCount).toBe(0)
    })
    
    it('recycles second of 3', function() {
        var a = interpolands.make(1)
        var b = interpolands.make(2)
        var c = interpolands.make(3)
        expect(interpolands.aliveCount).toBe(3)
        expect(interpolands.deadCount).toBe(0)
        
        interpolands.remove([b])
        expect(interpolands.aliveCount).toBe(2)
        expect(interpolands.deadCount).toBe(1)
        expect(interpolands.alive[0]).toBe(a)
        expect(interpolands.alive[1]).toBe(c)
        expect(interpolands.dead[0]).toBe(b)
        
        expect(a.curr).toBe(1)
        expect(a.dest).toBe(1)
        expect(c.curr).toBe(3)
        expect(c.dest).toBe(3)
    })
    
    it('recycles second and third of 5', function() {
        var a = interpolands.make(1)
        var b = interpolands.make(2)
        var c = interpolands.make(3)
        var d = interpolands.make(4)
        var e = interpolands.make(5)
        expect(interpolands.aliveCount).toBe(5)
        expect(interpolands.deadCount).toBe(0)
        
        interpolands.remove([b, c])
        expect(interpolands.aliveCount).toBe(3)
        expect(interpolands.deadCount).toBe(2)
        expect(interpolands.alive[0]).toBe(a)
        expect(interpolands.alive[1]).toBe(d)
        expect(interpolands.alive[2]).toBe(e)
        expect(interpolands.dead[0]).toBe(b)
        expect(interpolands.dead[1]).toBe(c)
        
        expect(a.curr).toBe(1)
        expect(a.dest).toBe(1)
        expect(d.curr).toBe(4)
        expect(d.dest).toBe(4)
        expect(e.curr).toBe(5)
        expect(e.dest).toBe(5)
    })
    
    it('recycles tween of destroyed interpolands', function() {
        var onDone = jasmine.createSpy()
        
        var inter = interpolands.make(0)
        inter.mod(2, 1, tween.linear, onDone)
        expect(interpolands.tweens.aliveCount).toBe(1)
        expect(interpolands.tweens.deadCount).toBe(0)
        expect(onDone).not.toHaveBeenCalled()
        
        interpolands.remove([inter])
        expect(interpolands.tweens.aliveCount).toBe(0)
        expect(interpolands.tweens.deadCount).toBe(1)
        
        inter = interpolands.make(9)
        var tw = inter.modTo(7, 1, tween.linear)
        expect(tw).toBeDefined()
        expect(tw.onDone).not.toBe(onDone)
        expect(onDone).not.toHaveBeenCalled()
        expect(inter.curr).toBe(9)
        expect(inter.dest).toBe(7)
    })
    
    it('interpolates linearly', function() {
        var onDone = jasmine.createSpy()
        
        var val = interpolands.make(1)
        expect(interpolands.aliveCount).toBe(1)
        expect(val.curr).toBe(1)
        
        val.mod(2, 1, tween.power_fac(1), onDone)
        expect(onDone).not.toHaveBeenCalled()
        expect(val.dest).toBe(3)
        interpolands.update(.5)
        expect(onDone).not.toHaveBeenCalled()
        expect(val.curr).toBe(2)
        
        interpolands.update(.5)
        expect(onDone).toHaveBeenCalled()
        expect(val.curr).toBe(3)
        
        onDone.calls.reset()
        interpolands.update(1)
        expect(onDone).not.toHaveBeenCalled()
        expect(val.curr).toBe(3)
    })
    
    it('supports concurrent interpolations', function() {
        var onDoneA = jasmine.createSpy()
        var onDoneB = jasmine.createSpy()
        
        var inter = interpolands.make(5)
        inter.mod(-5, 1, tween.power_fac(1), onDoneA)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(0)
        
        inter.mod(-2, 2, tween.power_fac(1), onDoneB)
        expect(onDoneB).not.toHaveBeenCalled()
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(-2)
        expect(interpolands.tweens.aliveCount).toBe(2)
        expect(interpolands.tweens.deadCount).toBe(0)
        
        interpolands.update(1)
        expect(onDoneA).toHaveBeenCalled()
        expect(onDoneB).not.toHaveBeenCalled()
        expect(inter.curr).toBe(-1)
        expect(inter.dest).toBe(-2)
        expect(interpolands.tweens.aliveCount).toBe(1)
        expect(interpolands.tweens.deadCount).toBe(1)
        
        onDoneA.calls.reset()
        interpolands.update(1)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(onDoneB).toHaveBeenCalled()
        expect(inter.curr).toBe(-2)
        expect(inter.dest).toBe(-2)
        expect(interpolands.tweens.aliveCount).toBe(0)
        expect(interpolands.tweens.deadCount).toBe(2)
    })
    
    it('can halt interpolation and snap to a value', function() {
        var onDone = jasmine.createSpy()
        
        var inter = interpolands.make(8)
        inter.mod(2, 1, tween.power_fac(1), onDone)
        expect(interpolands.tweens.aliveCount).toBe(1)
        expect(interpolands.tweens.deadCount).toBe(0)
        expect(onDone).not.toHaveBeenCalled()
        expect(inter.curr).toBe(8)
        expect(inter.dest).toBe(10)
        
        inter.setTo(5)
        expect(interpolands.tweens.aliveCount).toBe(0)
        expect(interpolands.tweens.deadCount).toBe(1)
        expect(onDone).not.toHaveBeenCalled()
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(5)
    })
    
    it('can snap value without halting interpolation', function() {
        var inter = interpolands.make(9)
        inter.mod(5, 1, tween.power_fac(1))
        inter.modNow(1)
        expect(interpolands.tweens.aliveCount).toBe(1)
        expect(inter.curr).toBe(10)
        expect(inter.dest).toBe(15)
        inter.modToNow(-1)
        expect(inter.curr).toBe(-6)
        expect(inter.dest).toBe(-1)
    })
    
    it('interpolates to a destination', function() {
        var onDoneA = jasmine.createSpy()
        var onDoneB = jasmine.createSpy()
        
        var inter = interpolands.make(-4)
        inter.mod(2, 1, tween.power_fac(1), onDoneA)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(inter.curr).toBe(-4)
        expect(inter.dest).toBe(-2)
        expect(interpolands.tweens.aliveCount).toBe(1)
        
        inter.modTo(2, 1, tween.power_fac(1), onDoneB)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(onDoneB).not.toHaveBeenCalled()
        expect(inter.curr).toBe(-4)
        expect(inter.dest).toBe(2)
        expect(interpolands.tweens.aliveCount).toBe(2)
        
        interpolands.update(.5)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(onDoneB).not.toHaveBeenCalled()
        expect(inter.curr).toBe(-1)
        expect(inter.dest).toBe(2)
        expect(interpolands.tweens.aliveCount).toBe(2)
        
        interpolands.update(.5)
        expect(onDoneA).toHaveBeenCalled()
        expect(onDoneB).toHaveBeenCalled()
        expect(inter.curr).toBe(2)
        expect(inter.dest).toBe(2)
        expect(interpolands.tweens.aliveCount).toBe(0)
    })
    
    it('precise interpolation chaining', function() {
        var onDoneB = jasmine.createSpy('B').and.callFake(function(remainder) {
            expect(remainder).toBe(200)
        })
        var onDoneA = jasmine.createSpy('A').and.callFake(function(remainder) {
            inter.mod(-1, 1000, tween.linear, onDoneB, remainder)
        })
        
        var inter = interpolands.make(0)
        inter.mod(1, 1000, tween.linear, onDoneA)
        expect(inter.dest).toBe(1)
        
        interpolands.update(100)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(inter.dest).toBe(1)
        
        interpolands.update(1500)
        expect(onDoneA).toHaveBeenCalled()
        onDoneA.calls.reset()
        expect(onDoneB).not.toHaveBeenCalled()
        expect(inter.dest).toBe(0)
        
        interpolands.update(600)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(onDoneB).toHaveBeenCalled()
        expect(inter.curr).toBe(0)
        expect(inter.dest).toBe(0)
    })
    
    it('interpolates with no net change', function() {
        var inter = interpolands.make(5)
        inter.mod_noDelta(2, 1000, function(x) { return Math.sin(x * Math.PI * 2) })
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(5)
        
        interpolands.update(250)
        expect(inter.curr).toBe(7)
        expect(inter.dest).toBe(5)
        
        interpolands.update(250)
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(5)
        
        interpolands.update(250)
        expect(inter.curr).toBe(3)
        expect(inter.dest).toBe(5)
        
        interpolands.update(250)
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(5)
        expect(interpolands.tweens.deadCount).toBe(1)
        
        interpolands.update(100)
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(5)
    })
    
    it('removes one interpoland without disturbing tweens of others', function() {
        var interA = interpolands.make(5)
        var ta = interA.mod(-1, 1, tween.linear)
        var tb = interA.mod(4, 4, tween.linear)
        var interB = interpolands.make(3)
        var tc = interB.mod(2, 2, tween.linear)
        var td = interA.mod(-5, 5, tween.linear)
        var te = interB.mod(3, 3, tween.linear)
        
        expect(interA.dest).toBe(3)
        expect(interB.dest).toBe(8)
        expect(interpolands.aliveCount).toBe(2)
        expect(interpolands.alive[0]).toBe(interA)
        expect(interpolands.alive[1]).toBe(interB)
        expect(interpolands.tweens.aliveCount).toBe(5)
        expect(interpolands.tweens.alive[0]).toBe(ta)
        expect(interpolands.tweens.alive[1]).toBe(tb)
        expect(interpolands.tweens.alive[2]).toBe(tc)
        expect(interpolands.tweens.alive[3]).toBe(td)
        expect(interpolands.tweens.alive[4]).toBe(te)
        
        interpolands.remove([interA])
        expect(interB.dest).toBe(8)
        expect(interpolands.aliveCount).toBe(1)
        expect(interpolands.alive[0]).toBe(interB)
        expect(interpolands.dead[0]).toBe(interA)
        expect(interpolands.tweens.aliveCount).toBe(2)
        expect(interpolands.tweens.dead[0]).toBe(ta)
        expect(interpolands.tweens.dead[1]).toBe(tb)
        expect(interpolands.tweens.dead[2]).toBe(td)
        expect(interpolands.tweens.alive[0]).toBe(tc)
        expect(interpolands.tweens.alive[1]).toBe(te)
    })
    
    it('handles multiple creations and removals', function() {
        var a = interpolands.make(1)
        var b = interpolands.make(2)
        var c = interpolands.make(3)
        var d = interpolands.make(4)
        var e = interpolands.make(5)
        
        interpolands.remove([d])
        expect(interpolands.aliveCount).toBe(4)
        expect(interpolands.dead[0]).toBe(d)
        
        expect(interpolands.make(6)).toBe(d)
        expect(interpolands.alive[3]).toBe(e)
        expect(interpolands.alive[4]).toBe(d)
        expect(d.curr).toBe(6)
        
        interpolands.remove([a])
        expect(interpolands.aliveCount).toBe(4)
        expect(interpolands.alive[0]).toBe(b)
        expect(interpolands.alive[1]).toBe(c)
        expect(interpolands.alive[2]).toBe(e)
        expect(interpolands.alive[3]).toBe(d)
        expect(interpolands.dead[0]).toBe(a)
        
        expect(interpolands.make(7)).toBe(a)
        expect(interpolands.aliveCount).toBe(5)
        expect(interpolands.alive[4]).toBe(a)
        expect(a.curr).toBe(7)
        
        interpolands.remove([c])
        interpolands.remove([b])
        interpolands.remove([e])
        expect(interpolands.aliveCount).toBe(2)
        expect(interpolands.alive[0]).toBe(d)
        expect(interpolands.alive[1]).toBe(a)
        expect(interpolands.dead[0]).toBe(c)
        expect(interpolands.dead[1]).toBe(b)
        expect(interpolands.dead[2]).toBe(e)
        
        expect(interpolands.make(8)).toBe(e)
        expect(e.curr).toBe(8)
        expect(interpolands.make(9)).toBe(b)
        expect(b.curr).toBe(9)
        expect(interpolands.make(10)).toBe(c)
        expect(c.curr).toBe(10)
        
        var f = interpolands.make(11)
        expect(interpolands.aliveCount).toBe(6)
        expect(interpolands.alive[0]).toBe(d)
        expect(interpolands.alive[1]).toBe(a)
        expect(interpolands.alive[2]).toBe(e)
        expect(interpolands.alive[3]).toBe(b)
        expect(interpolands.alive[4]).toBe(c)
        expect(interpolands.alive[5]).toBe(f)
    })
    
    it('will not reuse an interpoland that is already alive', function() {
        for(var i = 0; i < 30; i += 1)
            interpolands.make(0)
        for(var i = 0; i < interpolands.aliveCount; i += 6)
            interpolands.remove([interpolands.alive[i]])
        for(var i = 0; i < 30; i += 1)
            interpolands.make(0)
        interpolands.remove([interpolands.alive[0], interpolands.alive[1], interpolands.alive[2]])
        for(var i = 0; i < 90; i += 1)
            interpolands.make(0)
        for(var i = 0; i < 30; i += 1)
            interpolands.remove([interpolands.alive[40]])
        interpolands.make(0)
        
        for(var i = 0; i < interpolands.aliveCount - 1; i += 1)
            for(var j = i + 1; j < interpolands.aliveCount; j += 1)
                expect(interpolands.alive[i]).not.toBe(interpolands.alive[j])
    })
    
    it('will not update tweens that are added during update', function() {
        var inter = interpolands.make(0)
        var tweenB
        var onDone = jasmine.createSpy().and.callFake(function(remainder) {
            expect(remainder).toBe(0)
            tweenB = inter.mod(-1, 50, tween.circle, undefined, remainder)
        })
        var tweenA = inter.mod(1, 100, tween.linear, onDone)
        var tweenC = inter.mod(0, 1000, tween.sine)
        
        interpolands.update(100)
        expect(onDone).toHaveBeenCalled()
        expect(inter.curr).toBe(1)
        expect(inter.dest).toBe(0)
        expect(inter.tweens.aliveCount).toBe(2)
        expect(inter.tweens.alive[1]).toBe(tweenB)
        expect(inter.tweens.alive[0]).toBe(tweenC)
        expect(tweenB.dest).toBe(-1)
        expect(tweenB.duration).toBe(50)
        expect(tweenB.onDone).not.toBeDefined()
        expect(tweenB.func).toBe(tween.circle)
    })
    
})


},{"../interpolands":6,"../tween":19}],14:[function(require,module,exports){
'use strict'

var is = require('../is')


// for porting from QUnit
function ok(condition, reason) {
    expect(condition).toBe(true)
}

describe('Is', function() {
    it('object', function() {
        expect(is.object(function() {})).toBe(false)
        expect(is.object(is.func)).toBe(false)
        expect(is.object(setTimeout)).toBe(false)
        expect(is.object(true)).toBe(false)
        expect(is.object(false)).toBe(false)
        expect(is.object({})).toBe(true)
        expect(is.object([])).toBe(true)
        expect(is.object([1, 2])).toBe(true)
        expect(is.object({a: 3})).toBe(true)
        expect(is.object(9)).toBe(false)
        expect(is.object(0)).toBe(false)
        expect(is.object(-.1)).toBe(false)
        expect(is.object('')).toBe(false)
        expect(is.object('asdf')).toBe(false)
        expect(is.object(NaN)).toBe(false)
        expect(is.object(Infinity)).toBe(false)
        expect(is.object(undefined)).toBe(false)
        expect(is.object(null)).toBe(false)
    })
    it('function', function() {
        expect(is.func(function() {})).toBe(true)
        expect(is.func(is.func)).toBe(true)
        expect(is.func(setTimeout)).toBe(true)
        expect(is.func(true)).toBe(false)
        expect(is.func(false)).toBe(false)
        expect(is.func({})).toBe(false)
        expect(is.func([])).toBe(false)
        expect(is.func([1, 2])).toBe(false)
        expect(is.func({a: 3})).toBe(false)
        expect(is.func(9)).toBe(false)
        expect(is.func(0)).toBe(false)
        expect(is.func(-.1)).toBe(false)
        expect(is.func('')).toBe(false)
        expect(is.func('asdf')).toBe(false)
        expect(is.func(NaN)).toBe(false)
        expect(is.func(Infinity)).toBe(false)
        expect(is.func(undefined)).toBe(false)
        expect(is.func(null)).toBe(false)
    })
    it('boolean', function() {
        expect(is.boolean(true)).toBe(true)
        expect(is.boolean(false)).toBe(true)
        expect(is.boolean({})).toBe(false)
        expect(is.boolean([])).toBe(false)
        expect(is.boolean([1, 2])).toBe(false)
        expect(is.boolean({a: 3})).toBe(false)
        expect(is.boolean(9)).toBe(false)
        expect(is.boolean(0)).toBe(false)
        expect(is.boolean(-.1)).toBe(false)
        expect(is.boolean('')).toBe(false)
        expect(is.boolean('asdf')).toBe(false)
        expect(is.boolean(NaN)).toBe(false)
        expect(is.boolean(Infinity)).toBe(false)
        expect(is.boolean(undefined)).toBe(false)
        expect(is.boolean(null)).toBe(false)
        expect(is.boolean(function() {})).toBe(false)
    })
    it('actually a number', function() {
        ok(is.number(1))
        ok(is.number(100))
        ok(is.number(100.001))
        ok(is.number(0))
        ok(is.number(-90.3))
        ok(is.number(-90))
        ok(is.number(1 / 100000000 / 1000000 / 1000000))
        ok(is.number(100 * 100 * 100 * 100 * 100 * 100))
    })
    it('not pretending to be a number', function() {
        ok(!is.number(null))
        ok(!is.number(NaN))
        ok(!is.number(Infinity))
    })
    it('nullish', function() {
        ok(is.nullish(null), 'null')
        ok(is.nullish(undefined), undefined)
        ok(!is.nullish(''), 'empty string')
        ok(!is.nullish(0), 'zero')
        ok(!is.nullish([]), 'empty list')
        ok(!is.nullish({}), 'empty hash')
        ok(!is.nullish(NaN), 'NaN')
        expect(is.nullish(function() {})).toBe(false)
    })
    it('defined', function() {
        ok(is.defined({}), 'empty hash')
        ok(is.defined([]), 'empty list')
        ok(is.defined(''), 'empty string')
        ok(is.defined(0), 'zero')
        ok(is.defined(NaN), 'NaN')
        ok(!is.defined(undefined), 'undefined')
        ok(!is.defined(null), 'null')
        expect(is.defined(function() {})).toBe(true)
    })
    it('integer', function() {
        ok(!is.integer({}), 'empty hash')
        ok(!is.integer([]), 'empty list')
        ok(!is.integer(''), 'empty string')
        ok(is.integer(0), 'zero')
        ok(is.integer(1), '1')
        ok(is.integer(1.0), '1.0')
        ok(is.integer(-1), '-1')
        ok(is.integer(Math.pow(10000000, 1000000)), 'big int')
        ok(is.integer(Math.pow(10000000, 1000000) - 1), 'big int - 1')
        ok(is.integer(1e999), '1e999')
        ok(is.integer(1e99999 - .1), '1e99999 - .1')
        ok(!is.integer(.9), '.9')
        ok(!is.integer(1 / 2), '1 / 2')
        ok(!is.integer(1e-99), '1e-99')
        ok(!is.integer(NaN), 'NaN')
        ok(!is.integer(undefined), 'undefined')
        ok(!is.integer(null), 'null')
        expect(is.integer(function() {})).toBe(false)
    })
    it('composes functions', function() {
        expect(is.integer.or.nullish(null)).toBe(true)
        expect(is.integer.or.nullish(undefined)).toBe(true)
        expect(is.integer.or.nullish(1)).toBe(true)
        expect(is.integer.or.nullish(1.1)).toBe(false)
        
        expect(is.nullish.or.integer(null)).toBe(true)
        expect(is.nullish.or.integer(undefined)).toBe(true)
        expect(is.nullish.or.integer(1)).toBe(true)
        expect(is.nullish.or.integer(1.1)).toBe(false)
        
        expect(is.integer.or.number(-1)).toBe(true)
        expect(is.number.or.integer(-1)).toBe(true)
        expect(is.number.or.integer('asdf')).toBe(false)
        
        expect(is.integer.or.number.or.nullish(null)).toBe(true)
        expect(is.integer.or.number.or.nullish(1.1)).toBe(true)
        expect(is.integer.or.number.or.nullish(-5)).toBe(true)
    })
})


},{"../is":7}],15:[function(require,module,exports){
'use strict'

var ObjectPool = require('../object-pool')


function ObjectWithNumber(num) {
    this.num = num
}


describe('Object Pool', function() {
    var pool
    beforeEach(function() {
        pool = new ObjectPool(ObjectWithNumber)
        expect(pool.aliveCount).toBe(0)
        expect(pool.deadCount).toBe(0)
    })
    
    it('recycles destroyed objects', function() {
        var obj = pool.make(0)
        expect(obj.num).toBe(0)
        expect(pool.aliveCount).toBe(1)
        expect(pool.deadCount).toBe(0)
        
        pool.remove([obj])
        expect(pool.aliveCount).toBe(0)
        expect(pool.deadCount).toBe(1)
        
        var obj2 = pool.make(5)
        expect(obj2.num).toBe(5)
        expect(obj2).toBe(obj)
        expect(pool.aliveCount).toBe(1)
        expect(pool.deadCount).toBe(0)
    })
    
    it('recycles second of 3', function() {
        var a = pool.make(1)
        var b = pool.make(2)
        var c = pool.make(3)
        expect(pool.aliveCount).toBe(3)
        expect(pool.deadCount).toBe(0)
        
        pool.remove([b])
        expect(pool.aliveCount).toBe(2)
        expect(pool.deadCount).toBe(1)
        expect(pool.alive[0]).toBe(a)
        expect(pool.alive[1]).toBe(c)
        expect(pool.dead[0]).toBe(b)
        expect(a.num).toBe(1)
        expect(c.num).toBe(3)
    })
    
    it('recycles second and third of 5', function() {
        var a = pool.make(1)
        var b = pool.make(2)
        var c = pool.make(3)
        var d = pool.make(4)
        var e = pool.make(5)
        expect(pool.aliveCount).toBe(5)
        expect(pool.deadCount).toBe(0)
        
        pool.remove([b, c])
        expect(pool.aliveCount).toBe(3)
        expect(pool.deadCount).toBe(2)
        expect(pool.alive[0]).toBe(a)
        expect(pool.alive[1]).toBe(d)
        expect(pool.alive[2]).toBe(e)
        expect(pool.dead[0]).toBe(b)
        expect(pool.dead[1]).toBe(c)
        
        expect(a.num).toBe(1)
        expect(d.num).toBe(4)
        expect(e.num).toBe(5)
    })
    
    it('splices around given index', function() {
        var a = pool.make(1)
        var b = pool.make(2)
        var c = pool.make(3)
        expect(pool.aliveCount).toBe(3)
        expect(pool.deadCount).toBe(0)
        
        pool.removeAt(1)
        expect(pool.aliveCount).toBe(2)
        expect(pool.deadCount).toBe(1)
        expect(pool.alive[0]).toBe(a)
        expect(pool.alive[1]).toBe(c)
        expect(pool.dead[0]).toBe(b)
        
        expect(a.num).toBe(1)
        expect(c.num).toBe(3)
    })
    
    it('splices around the front of the list', function() {
        var a = pool.make(1)
        var b = pool.make(2)
        var c = pool.make(3)
        expect(pool.aliveCount).toBe(3)
        expect(pool.deadCount).toBe(0)
        
        pool.removeAt(0)
        expect(pool.aliveCount).toBe(2)
        expect(pool.deadCount).toBe(1)
        expect(pool.alive[0]).toBe(b)
        expect(pool.alive[1]).toBe(c)
        expect(pool.dead[0]).toBe(a)
        
        expect(b.num).toBe(2)
        expect(c.num).toBe(3)
    })
    
//    it('iterates over all elements', function() {
//        pool.make(1)
//        pool.make(2)
//        pool.make(3)
//        
//        var i = 1
//        for(var it = pool.iterator(); it.hasNext();) {
//            var obj = it.next()
//            expect(i).toBe(obj.num)
//            expect(i <= 3).toBe(true)
//            i += 1
//        }
//    })
//    
//    it('removes while iterating', function() {
//        pool.make(1)
//        pool.make(2)
//        pool.make(3)
//        pool.make(4)
//        pool.make(5)
//        
//        var i = 1
//        for(var it = pool.iterator(); it.hasNext();) {
//            var obj = it.next()
//            
//            if(i === 1 || i === 3)
//                it.remove()
//            
//            expect(i).toBe(obj.num)
//            expect(i <= 5).toBe(true)
//            i += 1
//        }
//
//        var i = 1
//        for(var it = pool.iterator(); it.hasNext();) {
//            var obj = it.next()
//            
//            if(i === 1 || i === 3)
//                i += 1
//            
//            expect(i).toBe(obj.num)
//            expect(i <= 5).toBe(true)
//            i += 1
//        }
//    })
    
    
})

},{"../object-pool":10}],16:[function(require,module,exports){
'use strict'

var sanity = require('../sanity')


describe('Esquire', function() {
    beforeEach(function() {
        jasmine.clock().install()
        jasmine.clock().mockDate()
        sanity.throws = true
    })
    afterEach(function() {
        jasmine.clock().uninstall()
    })
    
    require('./is')
    require('./turns')
    require('./object-pool')
    require('./interpoland')
    require('./avatar')
})

},{"../sanity":11,"./avatar":12,"./interpoland":13,"./is":14,"./object-pool":15,"./turns":17}],17:[function(require,module,exports){
'use strict'

var turns = require('../turns')


describe('Turns', function() {
    it('wraps angles', function() {
        expect(turns.wrap(1)).toBe(0)
        expect(turns.wrap(.5)).toBe(.5)
        expect(turns.wrap(-.5)).toBe(.5)
        expect(turns.wrap(.25)).toBe(.25)
        expect(turns.wrap(100)).toBe(0)
        expect(turns.wrap(-100)).toBe(0)
        expect(turns.wrap(-.25)).toBe(.75)
        expect(turns.wrap(-1.25)).toBe(.75)
    })
    
    it('computes the shortest offset', function() {
        expect(turns.shortestOffset(.5, .75)).toBe(.25)
        expect(turns.shortestOffset(.75, .5)).toBe(-.25)
        expect(turns.shortestOffset(0, .875)).toBe(-.125)
        expect(turns.shortestOffset(-.4, 0)).toBe(.4)
        expect(turns.shortestOffset(2, 3)).toBe(0)
        expect(turns.shortestOffset(2, .25)).toBe(.25)
        expect(turns.shortestOffset(9.125, -.125)).toBe(-.25)
        expect(Math.abs(turns.shortestOffset(0, .5))).toBe(.5)
        expect(Math.abs(turns.shortestOffset(.25, -.25))).toBe(.5)
    })
})

},{"../turns":18}],18:[function(require,module,exports){
'use strict'


exports.wrap = function(a) {
    var b = a - Math.ceil(a)
    return b && b + 1
}
exports.toRadians = function(a) {
    return a * 2 * Math.PI
}
exports.fromRadians = function(a) {
    return a / 2 / Math.PI
}
exports.shortestOffset = function(from, to) {
    return exports.wrap(exports.wrap(to) - exports.wrap(from) + 1.5) - .5
}

},{}],19:[function(require,module,exports){
'use strict'


exports.zero = function(x) { return 0 }
exports.one = function(x) { return 1 }
exports.linear = function(x) { return x }
exports.power_fac = function(exp) {
    if(exp === 1)
        return exports.linear
    return function(v) { return Math.pow(v, exp) }
}
function sine(x) { return Math.sin(x * Math.PI / 2) }
exports.sine = sine
exports.sine_2 = function(x) { return sine(sine(x)) }
exports.sine_3 = function(x) { return sine(sine(sine(x))) }
exports.cosine = function(x) { return (1 - Math.cos(x * Math.PI)) / 2 }
exports.circle = function(x) { return Math.sqrt(1 - Math.pow(x - 1, 2)) }
exports.reverseSine = function(x) { return 1 - Math.sin((x + 1) * Math.PI / 2) }

exports.noDelta_sine_fac = function(cycles) {
    if(arguments.length !== 1) // TODO
        throw new Error()
    if(isNaN(cycles))
        throw new Error()
    if(Math.floor(cycles * 2) !== cycles * 2)
        throw new Error('number of cycles must be multiple of .5')
    return function(x) { return Math.sin(x * Math.PI * 2 * cycles) }
}

exports.noDelta_quake_fac = function(cycles) {
    if(arguments.length !== 1) // TODO
        throw new Error()
    var subFunc = exports.noDelta_sine_fac(cycles)
    return function(x) { return (1 - x) * subFunc(x) }
}


},{}]},{},[16])