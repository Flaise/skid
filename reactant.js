'use strict';
if (typeof require !== 'undefined') {
    var EventDispatcher = require('./eventdispatcher');
}

var Reactant = (function () {
    function Reactant(value) {
        EventDispatcher.call(this);
        this.value = value;
    }
    Reactant.prototype.assignment = function (value) {
        this.setFunc(function () {
            return value;
        });
    };

    Reactant.prototype.setFunc = function (func, onMod) {
        var removal = this.setFuncSilent(func, onMod);
        this.proc();
        return removal;
    };
    Reactant.prototype.setFuncSilent = function (func, onMod) {
        var _this = this;
        if (this.unlink)
            this.unlink();

        this.valueFunc = func;

        if (onMod)
            this.unlink = onMod.listen(function () {
                return _this.proc();
            });
        else
            this.unlink = undefined;
        return this.unlink;
    };
    Reactant.prototype.depend = function (transformation, reactant) {
        this.setFunc((function () {
            return transformation(reactant.value);
        }), reactant);
    };
    Reactant.prototype.echo = function (reactant) {
        this.setFunc((function () {
            return reactant.value;
        }), reactant);
    };

    Reactant.prototype.proc = function () {
        var prev = this.lastValue;
        var curr = this.value;
        if (this.equality(prev, curr))
            return;

        // must be saved here because it might be altered during event propagation
        this.lastValue = curr;

        this.super_proc(prev, curr);
    };

    Reactant.prototype.equality = function (a, b) {
        if (a === b)
            return true;
        if (a && a.equals)
            return a.equals(b);
        if (b && b.equals)
            return b.equals(a);
        return false;
    };

    Reactant.prototype.listen_pc = function (callback) {
        var result = this.listen(callback);
        callback(undefined, this.value);

        // Don't have to check to see if the callback was removed because its removal wasn't made
        // accessible to any other stack frame yet.
        return result;
    };
    Reactant.prototype.and = function (other) {
        return this.compose(other, function (a, b) {
            return a && b;
        });
    };
    Reactant.prototype.or = function (other) {
        return this.compose(other, function (a, b) {
            return a || b;
        });
    };
    Reactant.prototype.transform = function (func) {
        var _this = this;
        var result = new Reactant();
        result.setFunc(function () {
            return func(_this.value);
        });

        ////////////////////////////////////////////////////// TODO: This listener needs to be removed when `result` has none of its own listeners, and re-added when it does
        var remove = this.listen(function () {
            return result.proc();
        });

        return result;
    };
    Reactant.prototype.onCondition = function (predicate) {
        var result = new EventDispatcher();
        this.listen(function (prev, curr) {
            if (predicate(prev, curr))
                result.proc();
        });
        return result;
    };
    Reactant.prototype.on = function (target) {
        var _this = this;
        return this.onCondition(function (prev, curr) {
            return _this.equality(curr, target);
        });
    };
    Reactant.prototype.onNot = function (target) {
        var _this = this;
        return this.onCondition(function (prev, curr) {
            return !_this.equality(curr, target);
        });
    };
    Reactant.prototype.onCondition_pc = function (predicate, callback) {
        var result = this.onCondition(predicate).listen(callback);
        if (predicate(undefined, this.value))
            callback();
        return result;
    };
    Reactant.prototype.on_pc = function (target, callback) {
        var _this = this;
        return this.onCondition_pc((function (prev, curr) {
            return _this.equality(curr, target);
        }), callback);
    };
    Reactant.prototype.valueFunc = function () {
        return undefined;
    };
    Reactant.prototype.compose = function (b, func) {
        var a = this;
        var result = new Reactant();
        result.setFunc(function () {
            return func(a.value, b.value);
        });

        ////////////////////////////////////////////////////// TODO: These listeners need to be removed when `result` has none of its own listeners, and re-added when it does
        var removeA = a.listen(result.proc.bind(result));
        var removeB = b.listen(result.proc.bind(result));

        return result;
    };

    Object.defineProperty(Reactant.prototype, "value", {
        get: function () {
            /*
            * Cannot return lastValue directly because reactants whose values depend on this
            * reactant cannot fire events correctly under the current implementation without
            * calling the valueFunc each time.
            */
            return this.valueFunc();
        },
        set: function (value) {
            this.assignment(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reactant.prototype, "not", {
        get: function () {
            return this.transform(function (a) {
                return !a;
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reactant.prototype, "negative", {
        get: function () {
            return this.transform(function (a) {
                return -a;
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reactant.prototype, "anyTruthy", {
        get: function () {
            var result = new EventDispatcher();

            this.listen(function (prev, curr) {
                if (curr)
                    result.proc();
            });
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reactant.prototype, "anyFalsy", {
        get: function () {
            // TODO: EventDispatcher.transform
            var result = new EventDispatcher();

            this.listen(function (prev, curr) {
                if (!curr)
                    result.proc();
            });
            return result;
        },
        enumerable: true,
        configurable: true
    });
    return Reactant;
})();
Reactant.prototype['__proto__'] = EventDispatcher.prototype;
Reactant.prototype.super_proc = EventDispatcher.prototype.proc;

if (typeof module !== 'undefined') {
    module.exports = Reactant;
}
//# sourceMappingURL=reactant.js.map
