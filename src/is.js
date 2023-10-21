export const is = {};

is.number = function(a) {
    return (typeof a === 'number') && a !== Infinity && a !== -Infinity && !isNaN(a);
};

is.defined = function(a) {
    return a != null;
};

is.nullish = function(a) {
    return a == null;
};

is.integer = function(a) {
    return Number.isInteger(a);
};

is.boolean = function(a) {
    return !!a === a;
};

is.function = function(a) {
    return typeof a === 'function';
};

is.object = function(a) {
    return typeof a === 'string' || (!!a && typeof a === 'object');
};

is.array = function(a) {
    return !!a && a.constructor === Array;
};

is.string = function(a) {
    return typeof a === 'string';
};

is.iterable = function(a) {
    return !!(a != null && a[Symbol.iterator]);
};

is.generatorFunction = function(a) {
    return a != null && a.constructor.name === 'GeneratorFunction';
};
