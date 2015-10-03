'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.wrap = wrap;
exports.toRadians = toRadians;
exports.fromRadians = fromRadians;
exports.shortestOffset = shortestOffset;
exports.toVector = toVector;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vector2 = require('./vector2');

var _vector22 = _interopRequireDefault(_vector2);

function wrap(a) {
    var b = a - Math.ceil(a);
    return b && b + 1;
}

function toRadians(a) {
    return a * 2 * Math.PI;
}

function fromRadians(a) {
    return a / 2 / Math.PI;
}

function shortestOffset(from, to) {
    return wrap(wrap(to) - wrap(from) + .5) - .5;
}

function toVector(a) {
    a = wrap(a);
    switch (a) {
        case NORTH:
            return new _vector22['default'](0, -1);
        case EAST:
            return new _vector22['default'](1, 0);
        case SOUTH:
            return new _vector22['default'](0, 1);
        case WEST:
            return new _vector22['default'](-1, 0);
        default:
            return (0, _vector2.rotatedXYTurns)(0, -1, a);
    }
}

var NORTH = 0;
exports.NORTH = NORTH;
var EAST = .25;
exports.EAST = EAST;
var SOUTH = .5;
exports.SOUTH = SOUTH;
var WEST = .75;
exports.WEST = WEST;
//# sourceMappingURL=turns.js.map