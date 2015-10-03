'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _defaultAvatar = require('./default-avatar');

var _defaultAvatar2 = _interopRequireDefault(_defaultAvatar);

var RectAvatar = (function (_DefaultAvatar) {
    _inherits(RectAvatar, _DefaultAvatar);

    function RectAvatar(avatars) {
        _classCallCheck(this, RectAvatar);

        _get(Object.getPrototypeOf(RectAvatar.prototype), 'constructor', this).call(this, avatars);
        this.anchorX = avatars.interpolands.make(0);
        this.anchorY = avatars.interpolands.make(0);
        this.fillStyle = undefined;
        this.strokeStyle = undefined;
        this.lineWidth = undefined;
        this.radius = undefined;
    }

    _createClass(RectAvatar, [{
        key: 'draw',
        value: function draw(context) {
            context.save();
            this.doTransform(context);
            if (this.anchorX.curr || this.anchorY.curr) context.translate(-this.w.curr * this.anchorX.curr, -this.h.curr * this.anchorY.curr);

            if (this.radius) doRoundRectPath(context, 0, 0, this.w.curr, this.h.curr, this.radius);

            if (this.fillStyle) {
                context.fillStyle = this.fillStyle;
                if (this.radius) context.fill();else context.fillRect(0, 0, this.w.curr, this.h.curr);
            }
            if (this.strokeStyle) {
                context.strokeStyle = this.strokeStyle;
                context.lineWidth = this.lineWidth;
                if (this.radius) context.stroke();else context.strokeRect(0, 0, this.w.curr, this.h.curr);
            }

            context.restore();
        }
    }, {
        key: 'remove',
        value: function remove() {
            if (this.removed) return;
            this.anchorX.remove();
            this.anchorY.remove();
            _get(Object.getPrototypeOf(RectAvatar.prototype), 'remove', this).call(this);
        }
    }]);

    return RectAvatar;
})(_defaultAvatar2['default']);

exports['default'] = RectAvatar;

function doRoundRectPath(context, x, y, w, h, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + w - radius, y);
    context.quadraticCurveTo(x + w, y, x + w, y + radius);
    context.lineTo(x + w, y + h - radius);
    context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    context.lineTo(x + radius, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
}
module.exports = exports['default'];
//# sourceMappingURL=rect-avatar.js.map