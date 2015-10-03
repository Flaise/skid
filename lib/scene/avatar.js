'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _is = require('../is');

var _is2 = _interopRequireDefault(_is);

var Avatar = (function () {
    function Avatar(avatars) {
        _classCallCheck(this, Avatar);

        this._layer = undefined;
        this._node = avatars.alive.addLast(this);
    }

    _createClass(Avatar, [{
        key: 'remove',
        value: function remove() {
            this._node.remove();
        }
    }, {
        key: 'draw',
        value: function draw(context) {
            console.warn('Called abstract function Avatar.draw().');
        }
    }, {
        key: '_shift',
        value: function _shift() {
            // SANITY(!this.removed) // TODO

            while (true) {
                var prev = this._node.prev;
                var prev_prev = prev.prev;
                var next = this._node.next;

                if (!prev.value) break;
                if (_is2['default'].defined(prev.value._layer) && prev.value._layer <= this._layer) break;

                prev.next = next;
                prev_prev.next = this._node;
                prev.prev = this._node;
            }

            while (true) {
                var prev = this._node.prev;
                var next = this._node.next;
                var next_next = next.next;

                if (!next.value) break;
                if (_is2['default'].nullish(next.value._layer) || next.value._layer >= this._layer) break;

                next.prev = prev;
                next_next.prev = this._node;
                next.next = this._node;
            }
        }
    }, {
        key: 'layer',
        get: function get() {
            return this._layer;
        },
        set: function set(value) {
            // SANITY(!(this._avatars && this._avatars._iterating)) // TODO
            // SANITY(is.number(value))
            if (value === this._layer) return;
            this._layer = value;
            this._shift();
        }
    }, {
        key: 'removed',
        get: function get() {
            return this._node.removed;
        }
    }]);

    return Avatar;
})();

exports['default'] = Avatar;
module.exports = exports['default'];
//# sourceMappingURL=avatar.js.map