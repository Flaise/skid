'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.zero = zero;
exports.one = one;
exports.linear = linear;
exports.power_fac = power_fac;
exports.quadratic = quadratic;
exports.cubic = cubic;
exports.quartic = quartic;
exports.sine = sine;
exports.sine_2 = sine_2;
exports.sine_3 = sine_3;
exports.cosine = cosine;
exports.circle = circle;
exports.reverseSine = reverseSine;
exports.noDelta_sine_fac = noDelta_sine_fac;
exports.noDelta_quake_fac = noDelta_quake_fac;

function zero(x) {
    return 0;
}

function one(x) {
    return 1;
}

function linear(x) {
    return x;
}

function power_fac(exp) {
    if (exp === 1) return linear;
    return function (x) {
        return Math.pow(x, exp);
    };
}

function quadratic(x) {
    return x * x;
}

function cubic(x) {
    return x * x * x;
}

function quartic(x) {
    return x * x * x * x;
}

function sine(x) {
    return Math.sin(x * Math.PI / 2);
}

function sine_2(x) {
    return sine(sine(x));
}

function sine_3(x) {
    return sine(sine(sine(x)));
}

function cosine(x) {
    return (1 - Math.cos(x * Math.PI)) / 2;
}

function circle(x) {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

function reverseSine(x) {
    return 1 - Math.sin((x + 1) * Math.PI / 2);
}

function noDelta_sine_fac(cycles) {
    if (arguments.length !== 1) // TODO
        throw new Error();
    if (isNaN(cycles)) throw new Error();
    if (Math.floor(cycles * 2) !== cycles * 2) throw new Error('number of cycles must be multiple of .5');
    return function (x) {
        return Math.sin(x * Math.PI * 2 * cycles);
    };
}

function noDelta_quake_fac(cycles) {
    var subFunc = noDelta_sine_fac(cycles);
    return function (x) {
        return (1 - x) * subFunc(x);
    };
}
//# sourceMappingURL=tween.js.map