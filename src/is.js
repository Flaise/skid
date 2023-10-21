
export function isNumber(a) {
    return (typeof a === 'number') && a !== Infinity && a !== -Infinity && !isNaN(a);
}

export function isDefined(a) {
    return a != null;
}

export function isNullish(a) {
    return a == null;
}

export function isInteger(a) {
    return Number.isInteger(a);
}

export function isBoolean(a) {
    return !!a === a;
}

export function isFunction(a) {
    return typeof a === 'function';
}

export function isObject(a) {
    return typeof a === 'string' || (!!a && typeof a === 'object');
}

export function isArray(a) {
    return !!a && a.constructor === Array;
}

export function isString(a) {
    return typeof a === 'string';
}

export function isIterable(a) {
    return !!(a != null && a[Symbol.iterator]);
}

export function isGeneratorFunction(a) {
    return a != null && a.constructor.name === 'GeneratorFunction';
}
