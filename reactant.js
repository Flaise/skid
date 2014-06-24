'use strict';
if (typeof require !== 'undefined')
    var EventDispatcher_ = require('./eventdispatcher');
else
    var EventDispatcher_ = EventDispatcher;

var Reactant = (function () {
    /*
    * Initializes the value of this reactant to the parameter or undefined if no parameter is given.
    * Example:
    * var a = new Reactant(9)
    * console.log(a.value) // prints 9
    */
    function Reactant(value) {
        EventDispatcher_.call(this);
        this.value = value;
    }
    /*
    * Compares two objects for equality. Assign to this instance member to override how equality is
    * calculated.
    * Example:
    * var a = new Reactant('asdf')
    * a.equality = function(r, s) {
    *     return r === s || (r && r.toLowerCase()) === (s && s.toLowerCase())
    * }
    * a.listen(function() { console.log('!!!') })
    * a.value = 'qwer' // prints '!!!'
    * a.value = 'QWER' // prints nothing because the value is not considered to have changed
    * console.log(a.value === 'QWER') // prints true because changing equality() only affects the
    *                                 // behavior of proc(), not setValue() or setFunc()
    */
    Reactant.prototype.equality = function (a, b) {
        if (a === b)
            return true;
        if (a && a.equals)
            return a.equals(b);
        if (b && b.equals)
            return b.equals(a);
        return false;
    };

    /*
    * Used by the value property, default setValue() function, and setFunc(). Do not assign to
    * this instance member directly.
    */
    Reactant.prototype.getValue = function () {
        return undefined;
    };

    /*
    * Controls the behavior of the value property assignment. Useful when the value of this
    * reactant is derived from something that isn't a reactant. Normally used with setFunc().
    * Example:
    * var mouseX = new Reactant()
    * mouseX.setFunc(function() { return GUI.getMouseX() })
    * GUI.addMouseMoveListener(function(x, y) {
    *     mouseX.proc()
    * })
    * mouseX.setValue = function(x) {
    *     GUI.setMouseX(x)
    *     mouseX.proc() // necessary if setMouseX() does not generate an event
    *                   // unnecessary but harmless otherwise
    * }
    * mouseX.value = 10 // sets the mouse x-position to 10, assuming sensible implementations of
    *                   // addMouseMoveListener() and setMouseX()
    */
    Reactant.prototype.setValue = function (value) {
        this.setFunc(function () {
            return value;
        });
    };

    /*
    * Sets how the value of this reactant is calculated. If the onMod parameter (which must be an
    * EventDispatcher or Reactant) is not specified, then the code that calls this function must
    * make sure that proc() is called whenever the return value of the func parameter changes - if
    * proc() is not called then this reactant won't fire events when it should. If the onMod
    * parameter IS specified, then it is probably more convenient to call depend() or compose()
    * instead.
    * Because of an implementation constraint, the func parameter is re-called every time the value
    * of this reactant is accessed. For best results, therefore, func should have no side effects
    * and only change what its return value is at most once per call to proc(). That is, a func
    * that 1. has a return value that changes without proc() being called or 2. changes during a
    * call to proc() - before the call to proc() returns - or 3. has significant side effects is
    * likely to result in this reactant having semantically incorrect, confusing, and difficult-to-
    * debug behavior.
    * Example 1:
    * var mouseX = new Reactant()
    * mouseX.setFunc(function() {
    *     return GUI.getMouseX()
    * })
    * GUI.addMouseMoveListener(function() {
    *     mouseX.proc()
    * })
    * mouseX.listen(function(previous, current) {
    *     console.log(previous, current)
    * })
    * // Each time the GUI framework generates a mouse motion event, the above code will print the
    * // previous and current mouse x-positions.
    *
    * Example2:
    * var a = new Reactant(5)
    * var valueOfA
    * a.listen_pc(function(previous, current) {
    *     valueOfA = current
    * })
    * console.log(valueOfA) // prints 5
    * var b = new Reactant()
    * b.setFunc(function() { return valueOfA }, a)
    * b.listen(function(previous, current) {
    *     console.log(previous, current)
    * })
    * a.value = 10 // prints 5, 10
    * // This example is for demonstration purposes. In this example it would be more
    * // straightforward to just call depend()
    */
    Reactant.prototype.setFunc = function (func, onMod) {
        var removal = this.setFuncSilent(func, onMod);
        this.proc();
        return removal;
    };

    Reactant.prototype.setFuncSilent = function (func, onMod) {
        var _this = this;
        if (this.unlink)
            this.unlink();

        this.getValue = func;

        // TODO: should only link when there are listeners on this reactant
        // TODO: should unlink when last listener is removed
        if (onMod)
            this.unlink = onMod.listen(function () {
                return _this.proc();
            });
        else
            this.unlink = undefined;
        return this.unlink;
    };

    /*
    * Called whenever the value of this reactant changes. It is only necessary to call this
    * externally when using setFunc with a null/undefined onMod parameter. It is typically easiest
    * to assign to the value of a reactant (i.e. reactant.value = ...) but when the getValue()
    * function of a reactant is computed dynamically instead of with property assignment then
    * proc() must be called every time the return value of getValue() changes.
    */
    Reactant.prototype.proc = function () {
        var prev = this.lastValue;
        var curr = this.value;
        if (this.equality(prev, curr))
            return;

        // must be saved here because it might be altered during event propagation
        this.lastValue = curr;

        this.super_proc(prev, curr);
    };

    /*
    * Returns a new event dispatcher that fires an event whenever this reactant changes in such a
    * manner as to make the specified predicate return true.
    * Example:
    * var a = new Reactant(5)
    * var b = a.onCondition(function(previous, current) {
    *     return previous > current // the reactant's value has decreased
    * })
    * b.listen(function() {
    *     console.log('!!!')
    * })
    * a.value = 9 // prints nothing
    * a.value = 8 // prints '!!!'
    * a.value = 8.1 // prints nothing
    */
    Reactant.prototype.onCondition = function (predicate) {
        var result = new EventDispatcher_();
        this.listen(function (prev, curr) {
            if (predicate(prev, curr))
                result.proc();
        });
        return result;
    };

    /*
    * Returns a new reactant whose value is calculated based on this reactant and the specified
    * other reactant. The value of the result is the return value of the func parameter when called
    * with the value of this and the other parameter as arguments.
    * Example:
    * var left = new Reactant(2)
    * var width = new Reactant(5)
    * var right = left.compose(width, function(r, s) { return r + s })
    * console.log(right.value) // prints 7
    * width.value = 6
    * console.log(right.value) // prints 8
    * right.listen(function(r, s) { console.log(r, s) })
    * left.value = -2 // prints 8, 4
    */
    Reactant.prototype.compose = function (other, func) {
        var _this = this;
        var result = new Reactant();
        result.setFunc((function () {
            return func(_this.value, other.value);
        }), this.aggregate(other));
        return result;
    };

    Object.defineProperty(Reactant.prototype, "value", {
        /*
        * Gets the value of this reactant which is typically whatever value was passed as a parameter
        * when this property was last assigned to. If setFunc() or a function that calls setFunc()
        * (depend, echo, compose), then the parameter to setFunc() determines what the value property
        * returns.
        * Example:
        * var a = new Reactant(7)
        * console.log(a.value) // prints 7
        * a.value = 9
        * console.log(a.value) // prints 9
        * a.setFunc(function() { return 'asdf' })
        * console.log(a.value) // prints 'asdf'
        */
        get: function () {
            // Cannot return lastValue directly because reactants whose values depend on this
            // reactant cannot fire events correctly under the current implementation without
            // calling getValue() each time.
            // Also required to make reactive tuples not break when the returned mutable list is changed.
            return this.getValue();
        },
        /*
        * Sets the value of this reactant. The implementation can be altered at runtime but by default
        * it sets the getValue function and then fires an event, although it will not fire an event if
        * the last value is the same value as the argument.
        * Example:
        * var a = new Reactant(5)
        * a.listen(function(previous, current) {
        *     console.log(previous, current)
        * })
        * a.value = 9 // prints 5, 9
        * a.value = 9 // prints nothing
        * console.log(a.value) // prints 9
        * a.value = 4 // prints 9, 4
        */
        set: function (value) {
            this.setValue(value);
        },
        enumerable: true,
        configurable: true
    });


    ///// SHORTCUTS
    /*
    * Returns a new reactant whose value is the result of a calculation performed on the value of
    * this reactant.
    * Example:
    * var a = new Reactant(1)
    * var b = a.transform(function(r) { return r + 5 })
    * console.log(b.value) // 6
    * a.value = 7
    * console.log(b.value) // 12
    */
    Reactant.prototype.transform = function (func) {
        var result = new Reactant();
        result.depend(func, this);
        return result;
    };

    /*
    * Calls the specified callback whenever the predicate returns true when passed the previous and
    * current values of this reactant. Also calls the callback immediately if the predicate returns
    * true after being passed undefined and the current value of the callback.
    * Example:
    * var a = new Reactant(1)
    * a.onCondition_pc(function(previous, current) {
    *     return current > 5
    * }, function() {
    *     console.log('!!!')
    * }) // prints nothing
    * a.value = 2 // prints nothing
    * a.value = 10 // prints '!!!'
    *
    * var b = new Reactant(2)
    * b.onCondition_pc(function(previous, current) {
    *     return current < 5
    * }, function() {
    *     console.log('!!!')
    * }) // prints '!!!'
    * a.value = 2 // prints '!!!'
    * a.value = 10 // prints nothing
    */
    Reactant.prototype.onCondition_pc = function (predicate, callback) {
        var result = this.onCondition(predicate).listen(callback);
        if (predicate(undefined, this.value))
            callback();
        return result;
    };

    /*
    * Same as listen() except "procs" the current value of the reactant. (_pc stands for "proc
    * current".) The `previous` parameter is undefined on the first call. The first call is
    * synchronous so nextTick(), setTimeout() or some equivalent must be used if this behavior is
    * undesired.
    * Example:
    * var a = new Reactant(4)
    * a.listen(function(previous, current) {
    *     console.log(previous, current)
    * }) // prints undefined, 4
    * a.value = 8 //prints 4, 8
    */
    Reactant.prototype.listen_pc = function (callback) {
        var result = this.listen(callback);
        callback(undefined, this.value);

        // Don't have to check to see if the callback was removed because its removal wasn't made
        // accessible to any other stack frame yet.
        return result;
    };

    /*
    * Returns a new event dispatcher that fires whenever the value of this reactant becomes equal
    * to the parameter. Unless the equality() member function is redefined at runtime, two values
    * are considered equal if they are identical according to the === operator or if either has an
    * equals() method that returns true.
    * Example:
    * var a = new Reactant(3)
    * a.on(new Vector(5, 5)).listen(function() { console.log('!!!') })
    * a.value = 9 // prints nothing
    * a.value = new Vector(5, 5) // prints '!!!' if Vector has a sensible equals() method,
    *                            // otherwise prints nothing
    */
    Reactant.prototype.on = function (target) {
        var _this = this;
        return this.onCondition(function (prev, curr) {
            return _this.equality(curr, target);
        });
    };

    /*
    * Same as on(), except events fire when the value of this reactant becomes anything that is not
    * equal to the parameter.
    * Example:
    * var a = new Reactant(9)
    * a.onNot(10).listen(function() { console.log('!!!') })
    * a.value = 4 // prints '!!!'
    * a.value = 5 // prints '!!!'
    * a.value = 10 // prints nothing
    *
    * To only fire events for when the value of this reactant changes from equal to not equal to
    * the a specified value called `r`, use this code instead:
    * reactant.transform(function(val) { return val === r }).on(true).listen( ... )
    */
    Reactant.prototype.onNot = function (target) {
        var _this = this;
        return this.onCondition(function (prev, curr) {
            return !_this.equality(curr, target);
        });
    };

    /*
    * Makes the value of this reactant be the result of a calculation performed on another reactant.
    * Example:
    * var left = new Reactant(2)
    * var right = new Reactant()
    * right.depend(function(r) { return r + 5 }, left)
    * console.log(right.value) // 7
    * left.value = 3
    * console.log(right.value) // 8
    */
    Reactant.prototype.depend = function (transformation, reactant) {
        this.setFunc((function () {
            return transformation(reactant.value);
        }), reactant);
    };

    /*
    * Makes this reactant become and remain equal to the specified other reactant.
    * Example:
    * var a = new Reactant(1)
    * var b = new Reactant(2)
    * a.echo(b)
    * console.log(a.value) // 2
    * b.value = 3
    * console.log(a.value) // 3
    */
    Reactant.prototype.echo = function (reactant) {
        this.depend((function (a) {
            return a;
        }), reactant);
    };

    /*
    * Invokes the specified callback whenever this callback's value becomes equal to the specified
    * target and immediately if it is already equal. Immediate invocations are synchronous. If
    * synchronous behavior is undesired, the callback may contain a call to nextTick() or
    * setTimeout() or something equivalent.
    * Example:
    * var a = new Reactant(5)
    * a.on_pc(5, function() { console.log(1) }) // prints 1
    * a.value = 4 // prints nothing
    * a.value = 5 // prints 1
    *
    * var b = new Reactant(4)
    * b.on_pc(5, function() { console.log(2) }) // prints nothing
    * b.value = 5 // prints 2
    */
    Reactant.prototype.on_pc = function (target, callback) {
        var _this = this;
        return this.onCondition_pc((function (prev, curr) {
            return _this.equality(curr, target);
        }), callback);
    };

    /*
    * Returns a new reactant whose value is the logical-AND of the values of this reactant and the
    * specified other reactant.
    * Example:
    * var a = new Reactant(true)
    * var b = new Reactant(false)
    * var c = a.and(b)
    * console.log(c.value) // false
    * b.value = true
    * console.log(c.value) // true
    */
    Reactant.prototype.and = function (other) {
        return this.compose(other, function (a, b) {
            return a && b;
        });
    };

    /*
    * Like and() except computes the logical-OR.
    */
    Reactant.prototype.or = function (other) {
        return this.compose(other, function (a, b) {
            return a || b;
        });
    };

    Object.defineProperty(Reactant.prototype, "not", {
        /*
        * Returns the transformation of this reactant to its boolean inverse. See transform()
        */
        get: function () {
            return this.transform(function (a) {
                return !a;
            });
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Reactant.prototype, "negative", {
        /*
        * Returns the transformation of this reactant to its numerical inverse. See transform()
        */
        get: function () {
            return this.transform(function (a) {
                return -a;
            });
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Reactant.prototype, "anyTruthy", {
        /*
        * Returns an event dispatcher that fires whenever the value of this reactant changes to a value
        * that is "truthy" (treated as true in an if-statement). Differs from a transformation (such as
        * reactant.transform(function(a) { return !!a }) ) in that an event fires when the value of
        * this reactant changes from a truthy value to another truthy value instead of only when the
        * value changes from a falsy to a truthy value.
        */
        get: function () {
            return this.onCondition(function (prev, curr) {
                return curr;
            });
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Reactant.prototype, "anyFalsy", {
        /*
        * Like anyTruthy, except events fire for falsy values like zero and the empty string instead of
        * truthy values.
        */
        get: function () {
            return this.onCondition(function (prev, curr) {
                return !curr;
            });
        },
        enumerable: true,
        configurable: true
    });

    Reactant.tuple = function () {
        var reactants = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            reactants[_i] = arguments[_i + 0];
        }
        var result = new Reactant();
        result.setFunc((function () {
            return reactants.map(function (r) {
                return r.value;
            });
        }), reactants.reduce(function (a, b) {
            return a.aggregate(b);
        }));
        return result;
    };
    return Reactant;
})();
Reactant.prototype['__proto__'] = EventDispatcher_.prototype;
Reactant.prototype.super_proc = EventDispatcher_.prototype.proc;

if (typeof module !== 'undefined')
    module.exports = Reactant;
//# sourceMappingURL=reactant.js.map
