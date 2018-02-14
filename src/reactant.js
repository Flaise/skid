import {EventDispatcher} from './event-dispatcher'

export class Reactant extends EventDispatcher {
    constructor(value) {
        super()
        this.unlink = undefined
        this.lastValue = undefined
        this.value = value
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

    getValue() {
        return undefined
    }

    setValue(value) {
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

        this.getValue = func

        // TODO: should only link when there are listeners on this reactant
        // TODO: should unlink when last listener is removed
        if(onMod)
            this.unlink = onMod.listen(() => this.proc())
        else
            this.unlink = undefined
        return this.unlink
    }

    proc() {
        const prev = this.lastValue
        const curr = this.value
        if(this.equality(prev, curr))
            return

        // must be saved here because it might be altered during event propagation
        this.lastValue = curr

        super.proc(prev, curr)
    }

    onCondition(predicate) {
        const result = new EventDispatcher()
        this.listen((prev, curr) => {
            if(predicate(prev, curr))
                result.proc()
        })
        return result
    }

    compose(other, func) {
        const result = new Reactant()
        result.setFunc((() => func(this.value, other.value)), this.aggregate(other))
        return result
    }

    get value() {
        // Cannot return lastValue directly because reactants whose values depend on this
        // reactant cannot fire events correctly under the current implementation without
        // calling getValue() each time.
        // Also required to make reactive tuples not break when the returned mutable list is changed.
        return this.getValue()
    }
    set value(value) {
        this.setValue(value)
    }


    transform(func) {
        const result = new Reactant()
        result.depend(func, this)
        return result
    }

    onCondition_pc(predicate, callback) {
        const result = this.onCondition(predicate).listen(callback)
        if(predicate(undefined, this.value))
            callback()
        return result
    }

    listen_pc(callback) {
        const result = this.listen(callback)
        callback(undefined, this.value)
        // Don't have to check to see if the callback was removed because its removal wasn't made
        // accessible to any other stack frame yet.
        return result
    }

    on(target) {
        return this.onCondition((prev, curr) => this.equality(curr, target))
    }

    onNot(target) {
        return this.onCondition((prev, curr) => !this.equality(curr, target))
    }

    depend(transformation, reactant) {
        this.setFunc((() => transformation(reactant.value)), reactant)
    }

    echo(reactant) {
        this.depend((a => a), reactant)
    }

    on_pc(target, callback) {
        return this.onCondition_pc(((prev, curr) => this.equality(curr, target)), callback)
    }

    and(other) {
        return this.compose(other, (a, b) => a && b)
    }

    or(other) {
        return this.compose(other, (a, b) => a || b)
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

    static tuple(...reactants) {
        const result = new Reactant()
        result.setFunc((() => reactants.map(r => r.value)),
                       reactants.reduce((a, b) => a.aggregate(b)))
        return result
    }
}
