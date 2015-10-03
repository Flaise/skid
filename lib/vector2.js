'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.ZERO = ZERO;
exports.distance = distance;
exports.distance4 = distance4;
exports.distance8 = distance8;
exports.rotatedXYTurns = rotatedXYTurns;
exports.rotatedXYRadians = rotatedXYRadians;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _turns = require('./turns');

var Vec2 = (function () {
    function Vec2(x, y) {
        _classCallCheck(this, Vec2);

        this.x = x;
        this.y = y;
    }

    _createClass(Vec2, [{
        key: 'equals',
        value: function equals(obj) {
            return obj && this.x === obj.x && this.y === obj.y;
        }
    }, {
        key: 'hashCode',
        value: function hashCode() {
            return this.x << 8 | this.y;
        }
    }, {
        key: 'sum',
        value: function sum(other) {
            if (isNaN(other)) return this.sumXY(other.x, other.y);else return this.sum((0, _turns.toVector)(other));
        }
    }, {
        key: 'sumXY',
        value: function sumXY(x, y) {
            return new Vec2(this.x + x, this.y + y);
        }
    }, {
        key: 'distance4',
        value: (function (_distance4) {
            function distance4(_x) {
                return _distance4.apply(this, arguments);
            }

            distance4.toString = function () {
                return _distance4.toString();
            };

            return distance4;
        })(function (other) {
            return distance4(this.x, this.y, other.x, other.y);
        })
    }, {
        key: 'distance8',
        value: (function (_distance8) {
            function distance8(_x2) {
                return _distance8.apply(this, arguments);
            }

            distance8.toString = function () {
                return _distance8.toString();
            };

            return distance8;
        })(function (other) {
            return distance8(this.x, this.y, other.x, other.y);
        })
    }, {
        key: 'rotatedTurns',
        value: function rotatedTurns(angle) {
            return rotatedXYTurns(this.x, this.y, angle);
        }
    }, {
        key: 'rotatedRadians',
        value: function rotatedRadians(angle) {
            return rotatedXYRadians(this.x, this.y, angle);
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.x + ',' + this.y;
        }
    }, {
        key: 'inverse',
        get: function get() {
            return new Vec2(-this.x, -this.y);
        }
    }]);

    return Vec2;
})();

exports['default'] = Vec2;

function ZERO() {
    return new Vec2(0, 0);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function distance4(x1, y1, x2, y2) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
}

function distance8(x1, y1, x2, y2) {
    return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
}

function rotatedXYTurns(x, y, angle) {
    return rotatedXYRadians(x, y, (0, _turns.toRadians)(angle));
}

function rotatedXYRadians(x, y, angle) {
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    return new Vec2(x * c - y * s, x * s + y * c);
}
//# sourceMappingURL=vector2.js.map