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

var _is = require('../is');

var _is2 = _interopRequireDefault(_is);

var TextAvatar = (function (_Avatar) {
    _inherits(TextAvatar, _Avatar);

    function TextAvatar(avatars, camera) {
        _classCallCheck(this, TextAvatar);

        _get(Object.getPrototypeOf(TextAvatar.prototype), 'constructor', this).call(this, avatars);
        this._interpolands = avatars.interpolands;
        this.x = avatars.interpolands.make(0);
        this.y = avatars.interpolands.make(0);
        this.opacity = avatars.interpolands.make(1);
        this.camera = camera;
        this.font = undefined;
        this.text = '';
        this.textAlign = 'center'; // options: center, left, right
        this.textBaseline = 'middle'; // options: middle, top, bottom
        this.fillStyle = undefined; // example: 'black'
        this.strokeStyle = undefined;
        this.lineWidth = undefined;
    }

    _createClass(TextAvatar, [{
        key: 'draw',
        value: function draw(context) {
            var canvas = context.canvas;
            var cw = canvas.width;
            var ch = canvas.height;

            context.save();
            context.globalAlpha = esquire.clamp(this.opacity.curr, 0, 1);

            if (_is2['default']['function'](this.font)) context.font = this.font(cw, ch);else context.font = this.font;

            if (this.x.curr || this.y.curr) context.translate(this.x.curr, this.y.curr);
            context.scale(1 / (cw / this.camera.w.curr), 1 / (ch / this.camera.h.curr));

            context.textAlign = this.textAlign;
            context.textBaseline = this.textBaseline;

            if (this.strokeStyle) {
                if (_is2['default']['function'](this.lineWidth)) context.lineWidth = this.lineWidth(cw, ch);else context.lineWidth = this.lineWidth;
                context.strokeStyle = this.strokeStyle;
                context.strokeText(this.text, 0, 0);
            }
            if (this.fillStyle) {
                context.fillStyle = this.fillStyle;
                context.fillText(this.text, 0, 0);
            }

            context.restore();
        }
    }, {
        key: 'remove',
        value: function remove() {
            if (this.removed) return;
            this.x.remove();
            this.y.remove();
            this.opacity.remove();
            _get(Object.getPrototypeOf(TextAvatar.prototype), 'remove', this).call(this);
        }
    }]);

    return TextAvatar;
})(_avatar2['default']);

exports['default'] = TextAvatar;
module.exports = exports['default'];
//# sourceMappingURL=text-avatar.js.map