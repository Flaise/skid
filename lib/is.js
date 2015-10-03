'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var funcs = {};
exports['default'] = funcs;

funcs.number = function (a) {
    return typeof a === 'number' && a !== Infinity && !isNaN(a);
};

funcs.defined = function (a) {
    return a != null;
};

funcs.nullish = function (a) {
    return a == null;
};

funcs.integer = function (a) {
    return Math.abs(a) !== Infinity && a === Math.floor(a);
};

funcs.boolean = function (a) {
    return !!a === a;
};

funcs['function'] = function (a) {
    return typeof a === 'function';
};

funcs.object = function (a) {
    return !!a && typeof a === 'object';
};

funcs.array = function (a) {
    return !!a && a.constructor === Array;
};

funcs.string = function (a) {
    return typeof a === 'string';
};

funcs.iterable = function (a) {
    return !!(a != null && a[Symbol.iterator]);
};

function composeOr(r, s) {
    return addCompositorsTo(function (a) {
        return r(a) || s(a);
    });
}

function makeCompositions(func, compositor) {
    var result = {};

    var _loop = function (_key) {
        Object.defineProperty(result, _key, { get: function get() {
                return compositor(func, funcs[_key]);
            } });
    };

    for (var _key in funcs) {
        _loop(_key);
    }return result;
}

function addCompositorsTo(func) {
    func.or = makeCompositions(func, composeOr);
    return func;
}
for (var key in funcs) addCompositorsTo(funcs[key]);
module.exports = exports['default'];
//# sourceMappingURL=is.js.map