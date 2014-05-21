'use strict'

if(typeof require !== 'undefined')
    var EventDispatcher_:any = require('./eventdispatcher')
else
    var EventDispatcher_:any = EventDispatcher

class Reactant {
    unlink
    lastValue
    super_proc
    listen
    
    constructor(value?) {
        EventDispatcher_.call(this)
        this.value = value
    }
    
    assignment(value) {
        this.setFunc(() => value)
    }
    
    setFunc(func, onMod?) {
        var removal = this.setFuncSilent(func, onMod)
        this.proc()
        return removal
    }
    setFuncSilent(func, onMod?) {
        if(this.unlink)
            this.unlink()

        this.valueFunc = func

        // TODO: should only link when there are listeners on this reactant
        if(onMod)
            this.unlink = onMod.listen(() => this.proc())
        else
            this.unlink = undefined
        return this.unlink
    }
    depend(transformation, reactant) {
        this.setFunc((() => transformation(reactant.value)), reactant)
    }
    echo(reactant) {
        this.setFunc((() => reactant.value), reactant)
    }
    
    proc() {
        var prev = this.lastValue
        var curr = this.value
        if(this.equality(prev, curr))
            return

        // must be saved here because it might be altered during event propagation
        this.lastValue = curr
        
        this.super_proc(prev, curr)
    }
    
    listen_pc(callback) {
        var result = this.listen(callback)
        callback(undefined, this.value)
        // Don't have to check to see if the callback was removed because its removal wasn't made
        // accessible to any other stack frame yet.
        return result
    }
    and(other) {
        return this.compose(other, (a, b) => a && b)
    }
    or(other) {
        return this.compose(other, (a, b) => a || b)
    }
    transform(func) {
        var result = new Reactant()
        result.depend(func, this)
        return result
    }
    onCondition(predicate) {
        var result = new EventDispatcher_()
        this.listen((prev, curr) => {
            if(predicate(prev, curr))
                result.proc()
        })
        return result
    }
    on(target) {
        return this.onCondition((prev, curr) =>  this.equality(curr, target))
    }
    onNot(target) {
        return this.onCondition((prev, curr) => !this.equality(curr, target))
    }
    onCondition_pc(predicate, callback) {
        var result = this.onCondition(predicate).listen(callback)
        if(predicate(undefined, this.value))
            callback()
        return result
    }
    on_pc(target, callback) {
        return this.onCondition_pc(((prev, curr) => this.equality(curr, target)), callback)
    }
    compose(b, func) {
        var a = this
        var result = new Reactant()
        result.setFunc(() => func(a.value, b.value))

        ////////////////////////////////////////////////////// TODO: These listeners need to be removed when `result` has none of its own listeners, and re-added when it does
        var removeA = a.listen(result.proc.bind(result))
        var removeB = b.listen(result.proc.bind(result))

        return result
    }
    
    get value() {
        // Cannot return lastValue directly because reactants whose values depend on this
        // reactant cannot fire events correctly under the current implementation without
        // calling the valueFunc each time.
        return this.valueFunc()
    }
    set value(value) {
        this.assignment(value)
    }
    get not() {
        return this.transform(a => !a)
    }
    get negative() {
        return this.transform(a => -a)
    }
    get anyTruthy() {
        return this.onCondition((prev, curr) => curr)
    }
    get anyFalsy() {
        return this.onCondition((prev, curr) => !curr)
    }
    
    equality(a, b) {
        if(a === b)
            return true
        if(a && a.equals)
            return a.equals(b)
        if(b && b.equals)
            return b.equals(a)
        return false
    }
    valueFunc() {
        return undefined
    }
}
Reactant.prototype['__proto__'] = EventDispatcher_.prototype
Reactant.prototype.super_proc = EventDispatcher_.prototype.proc

if(typeof module !== 'undefined')
    module.exports = Reactant
