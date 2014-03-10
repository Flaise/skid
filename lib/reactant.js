
function equals(a, b) {
    if(a === b)
        return true
    if(a && a.equals)
        return a.equals(b)
    if(b && b.equals)
        return b.equals(a)
    return false
}

function Reactant(value) {
    EventDispatcher.call(this)
    this.value = value
}
Reactant.prototype.__proto__ = EventDispatcher.prototype

Object.defineProperty(Reactant.prototype, 'value', {
    get: function() {
        if(this.valueFunc) return this.valueFunc()
        return undefined
    },
    set: function(value) {
        this.setFunc(function() { return value })
    }
})
Reactant.prototype.setFunc = function(func, onMod) {
    var removal = this.setFuncSilent(func, onMod)
    this.proc()
    return removal
}
Reactant.prototype.setFuncSilent = function(func, onMod) {
    if(this.breakHierarchy) this.breakHierarchy()
    this.breakHierarchy = undefined

    this.valueFunc = func

    if(onMod)
        this.breakHierarchy = onMod.listen(this.proc.bind(this))
    return this.breakHierarchy
}

Reactant.prototype.super_proc = Reactant.prototype.proc
Reactant.prototype.proc = function() {
    var prev = this.lastValue
    var curr = this.value
    if(equals(prev, curr)) return

    this.lastValue = curr // must be saved here because it might be altered during event propagation
    this.super_proc(prev, curr)
}


Reactant.prototype.listen_pc = function(callback) {
    callback(undefined, this.value)
    return this.listen(callback)
}

Reactant.prototype.and = function(other) {
    return this.compose(other, function(a, b) { return a && b })
}
Reactant.prototype.or = function(other) {
    return this.compose(other, function(a, b) { return a || b })
}
Object.defineProperty(Reactant.prototype, 'not', {
    get: function() { return this.transform(function(a) { return !a }) }
})
Object.defineProperty(Reactant.prototype, 'negative', {
    get: function() { return this.transform(function(a) { return -a }) }
})
Reactant.prototype.compose = function(b, func) {
    var a = this
    var result = new Reactant()
    result.setFunc(function() {
        return func(a.value, b.value)
    })

    ////////////////////////////////////////////////////// TODO: These listeners need to be removed when `result` has none of its own listeners, and re-added when it does
    //var remove1 = a.listen(function() { result.proc() })
    //var remove2 = b.listen(function() { result.proc() })
    var removeA = a.listen(result.proc.bind(result))
    var removeB = b.listen(result.proc.bind(result))

    return result
}
Reactant.prototype.transform = function(func) {
    var result = new Reactant()
    result.setFunc(function() { return func(this.value) }.bind(this))

    ////////////////////////////////////////////////////// TODO: This listener needs to be removed when `result` has none of its own listeners, and re-added when it does
    //var remove = this.listen(function() { result.proc() })
    var remove = this.listen(result.proc.bind(result))

    return result
}
Reactant.prototype.onCondition = function(predicate) {
    return this.transform(predicate).on(true)
}
Reactant.prototype.on = function(target) {
    var result = new EventDispatcher()

    ////////////////////////////////////////////////////// TODO: This listener needs to be removed when `result` has none of its own listeners, and re-added when it does
    this.listen(function(prev, curr) {
        if(curr === target) // Use ==, ===, or deepEquals?? Might change depending on task.
            result.proc()
    })
    return result
}
Reactant.prototype.onNot = function(target) {
    var result = new EventDispatcher()

    ////////////////////////////////////////////////////// TODO: This listener needs to be removed when `result` has none of its own listeners, and re-added when it does
    this.listen(function(prev, curr) {
        if(curr !== target)
            result.proc()
    })
    return result
}
/////////////////////////////////////////////// TODO: reactant.filter

/*Reactant.prototype.filter = function(predicate) {
	var result = new EventDispatcher()
	this.listen(function(prev, curr) {
		if(predicate(prev, curr))
			dispatcher.proc(prev, curr)
	})
	return result
}*/ // will uncomment when use-case and test are available
