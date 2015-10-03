'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _eventDispatcher = require('../event-dispatcher');

var _eventDispatcher2 = _interopRequireDefault(_eventDispatcher);

var _is = require('../is');

var _is2 = _interopRequireDefault(_is);

var _interpolands = require('../interpolands');

var _interpolands2 = _interopRequireDefault(_interpolands);

var _linkedList = require('../linked-list');

var _linkedList2 = _interopRequireDefault(_linkedList);

var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    return window.setTimeout(callback, 1000 / 60);
};

var Viewport = (function () {
    function Viewport(canvas) {
        _classCallCheck(this, Viewport);

        this.canvas = canvas;
        this.interpolands = new _interpolands2['default']();
        this.alive = new _linkedList2['default']();
        this.onBeforeDraw = new _eventDispatcher2['default']();
        this.onAfterDraw = new _eventDispatcher2['default']();
        this.lastFrame = undefined;
        this.animFrame = false;
    }

    _createClass(Viewport, [{
        key: 'changed',
        value: function changed() {
            var _this = this;

            if (this.animFrame) return;
            if (_is2['default'].nullish(this.lastFrame)) this.lastFrame = Date.now();
            requestAnimFrame(function () {
                _this.animFrame = false;
                _this.draw();
            });
            this.animFrame = true;
        }
    }, {
        key: 'repeatDraw',
        value: function repeatDraw() {
            var _this2 = this;

            this.changed();
            this.onAfterDraw.listen(function () {
                return _this2.changed();
            });
        }
    }, {
        key: 'draw',
        value: function draw() {
            if (!this.canvas) return;

            var context = this.canvas.getContext('2d');
            this.onBeforeDraw.proc(context);
            this.update();
            this.alive.forEach(function (avatar) {
                return avatar.draw(context);
            });
            this.onAfterDraw.proc(context);
        }
    }, {
        key: 'update',
        value: function update() {
            var currentFrame = Date.now();
            this.interpolands.update(currentFrame - this.lastFrame);
            this.lastFrame = currentFrame;
        }
    }]);

    return Viewport;
})();

exports['default'] = Viewport;
module.exports = exports['default'];
//# sourceMappingURL=viewport.js.map