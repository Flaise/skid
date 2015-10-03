'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventDispatcher = require('../event-dispatcher');

var _eventDispatcher2 = _interopRequireDefault(_eventDispatcher);

var _group = require('./group');

var _group2 = _interopRequireDefault(_group);

var Camera = (function (_Group) {
    _inherits(Camera, _Group);

    function Camera(avatars) {
        _classCallCheck(this, Camera);

        _get(Object.getPrototypeOf(Camera.prototype), 'constructor', this).call(this, avatars);
        this.x = avatars.interpolands.make(0);
        this.y = avatars.interpolands.make(0);
        this.w = avatars.interpolands.make(0);
        this.h = avatars.interpolands.make(0);
        this.anchorX = avatars.interpolands.make(0);
        this.anchorY = avatars.interpolands.make(0);
        this.angle = avatars.interpolands.make(0);
        this.onBeforeDraw = new _eventDispatcher2['default']();
    }

    _createClass(Camera, [{
        key: 'remove',
        value: function remove() {
            if (this.removed) return;
            this.x.remove();
            this.y.remove();
            this.w.remove();
            this.h.remove();
            this.anchorX.remove();
            this.anchorY.remove();
            this.angle.remove();
            _get(Object.getPrototypeOf(Camera.prototype), 'remove', this).call(this);
        }
    }, {
        key: 'draw',
        value: function draw() {
            this.onBeforeDraw.proc();

            var canvas = context.canvas;

            context.save();
            context.scale(canvas.width / this.w.curr, canvas.height / this.h.curr);

            var dx = -this.x.curr + this.w.curr * this.anchorX.curr;
            var dy = -this.y.curr + this.h.curr * this.anchorY.curr;
            if (dx || dy) context.translate(dx, dy);

            _get(Object.getPrototypeOf(Camera.prototype), 'draw', this).call(this, context);

            context.restore();
        }
    }]);

    return Camera;
})(_group2['default']);

exports['default'] = Camera;
module.exports = exports['default'];
//# sourceMappingURL=camera.js.map