"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clamp = clamp;
exports.randomInteger = randomInteger;
exports.randomFloat = randomFloat;
exports.linearInterpolate = linearInterpolate;
exports.positiveModulus = positiveModulus;

function clamp(_x, _x2, _x3) {
    var _again = true;

    _function: while (_again) {
        var value = _x,
            lo = _x2,
            hi = _x3;
        _again = false;

        if (lo > hi) {
            _x = value;
            _x2 = hi;
            _x3 = lo;
            _again = true;
            continue _function;
        }
        if (value < lo) return lo;
        if (value > hi) return hi;
        return value;
    }
}

function randomInteger(_x4, _x5) {
    var _again2 = true;

    _function2: while (_again2) {
        var lo = _x4,
            hi = _x5;
        _again2 = false;

        if (lo > hi) {
            _x4 = hi;
            _x5 = lo;
            _again2 = true;
            continue _function2;
        }
        if (lo !== Math.floor(lo)) throw new Error();
        if (hi !== Math.floor(hi)) throw new Error();
        return Math.floor(Math.random() * (hi - lo)) + lo;
    }
}

function randomFloat(_x6, _x7) {
    var _again3 = true;

    _function3: while (_again3) {
        var lo = _x6,
            hi = _x7;
        _again3 = false;

        if (lo > hi) {
            _x6 = hi;
            _x7 = lo;
            _again3 = true;
            continue _function3;
        }
        return Math.random() * (hi - lo) + lo;
    }
}

function linearInterpolate(from, to, factor) {
    if (from > to) return exports.lerp(to, from, 1 - factor);
    if (factor <= 0) return from;
    if (factor >= 1) return to;
    return from + (to - from) * factor;
}

function positiveModulus(r, s) {
    return (r % s + s) % s;
}
//# sourceMappingURL=scalars.js.map