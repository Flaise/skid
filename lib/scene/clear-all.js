'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _avatar = require('./avatar');

var _avatar2 = _interopRequireDefault(_avatar);

/*
 * Clears the entire canvas. It is advisable to use this when the entire canvas is not being drawn
 * on every frame. Omitting a ClearAll operation can, however, mitigate rendering artifacts caused
 * by tiling alpha-blended images on some rendering engines, such as Firefox.
 */

var ClearAll = (function (_Avatar) {
    _inherits(ClearAll, _Avatar);

    function ClearAll(avatars) {
        _classCallCheck(this, ClearAll);

        _get(Object.getPrototypeOf(ClearAll.prototype), 'constructor', this).call(this, avatars);
    }

    _createClass(ClearAll, [{
        key: 'draw',
        value: function draw(context) {
            var canvas = context.canvas;
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }]);

    return ClearAll;
})(_avatar2['default']);

exports['default'] = ClearAll;
module.exports = exports['default'];
//# sourceMappingURL=clear-all.js.map