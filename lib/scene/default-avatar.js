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

var _turns = require('../turns');

var _scalars = require('../scalars');

var DefaultAvatar = (function (_Avatar) {
    _inherits(DefaultAvatar, _Avatar);

    function DefaultAvatar(avatars) {
        _classCallCheck(this, DefaultAvatar);

        _get(Object.getPrototypeOf(DefaultAvatar.prototype), 'constructor', this).call(this, avatars);
        this.x = avatars.interpolands.make(0);
        this.y = avatars.interpolands.make(0);
        this.w = avatars.interpolands.make(0);
        this.h = avatars.interpolands.make(0);
        this.angle = avatars.interpolands.make(0);

        // TODO: use Opacity node
        this.opacity = avatars.interpolands.make(1);
        this.skipAlpha = undefined;
    }

    _createClass(DefaultAvatar, [{
        key: 'doTransform',
        value: function doTransform(context) {
            if (this.x.curr || this.y.curr) context.translate(this.x.curr, this.y.curr);
            if (this.angle.curr) context.rotate((0, _turns.toRadians)(this.angle.curr));
            // can't scale here; it breaks radii and strokes
            if (!this.skipAlpha) ////////// TODO: always use Opacity group
                context.globalAlpha = (0, _scalars.clamp)(this.opacity.curr, 0, 1);
        }
    }, {
        key: 'remove',
        value: function remove() {
            if (this.removed) return;
            this.x.remove();
            this.y.remove();
            this.w.remove();
            this.h.remove();
            this.angle.remove();
            this.opacity.remove();
            _get(Object.getPrototypeOf(DefaultAvatar.prototype), 'remove', this).call(this);
        }
    }]);

    return DefaultAvatar;
})(_avatar2['default']);

exports['default'] = DefaultAvatar;
module.exports = exports['default'];
//# sourceMappingURL=default-avatar.js.map