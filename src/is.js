const all = {}
export default all

all.number = function(a) {
    return (typeof a === 'number') && a !== Infinity && a !== -Infinity && !isNaN(a)
}

all.defined = function(a) {
    return a != null
}

all.nullish = function(a) {
    return a == null
}

all.integer = function(a) {
    return Number.isInteger(a)
}

all.boolean = function(a) {
    return !!a === a
}

all.function = function(a) {
    return typeof a === 'function'
}

all.object = function(a) {
    return typeof a === 'string' || (!!a && typeof a === 'object')
}

all.array = function(a) {
    return !!a && a.constructor === Array
}

all.string = function(a) {
    return typeof a === 'string'
}

all.iterable = function(a) {
    return !!(a != null && a[Symbol.iterator])
}

function composeOr(funcA, funcB) {
    return addCompositorsTo((a) => funcA(a) || funcB(a))
}

function makeCompositions(func, compositor) {
    const result = {}
    for(let key in all) {
        const otherFunc = all[key]
        Object.defineProperty(result, key, {get: () => compositor(func, otherFunc)})
    }
    return result
}

function addCompositorsTo(func) {
    func.or = makeCompositions(func, composeOr)
    return func
}
for(var key in all)
    addCompositorsTo(all[key])
