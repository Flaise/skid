'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _icon = require('./icon');

var _icon2 = _interopRequireDefault(_icon);

var Atlas = (function () {
    function Atlas() {
        _classCallCheck(this, Atlas);

        this.icons = Object.create(null);
        this.layout = undefined;
    }

    _createClass(Atlas, [{
        key: 'get',
        value: function get(name) {
            var icon = this.icons[name];
            if (!icon) {
                var sprite = this.layout && this.layout.sprites && this.layout.sprites[name];
                icon = new _icon2['default'](this, sprite);
                this.icons[name] = icon;
            }
            return icon;
        }
    }, {
        key: 'has',
        value: function has(name) {
            return !!(this.icons[name] || this.layout && this.layout[name]);
        }
    }, {
        key: 'loadImage',
        value: function loadImage(source, next) {
            var _this = this;

            loadImageObject(source, function (err, image) {
                if (err) return next && next(err);

                _this.image = image;
                next();
            });
        }
    }, {
        key: 'load',
        value: function load(data, next) {
            var oldImage = this.layout && this.layout.image;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(data.sprites)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var spriteName = _step.value;

                    var icon = this.icons[spriteName];
                    if (icon) icon.load(data.sprites[spriteName]);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.layout = data;

            if (data.image && data.image !== oldImage) {
                this.image = undefined;
                this.loadImage(data.image, next);
            } else {
                setTimeout(next);
            }
        }
    }]);

    return Atlas;
})();

exports['default'] = Atlas;

function loadImageObject(source, next) {
    var image = new window.Image();
    image.onload = function () {
        image.onload = image.onerror = image.onabort = undefined;
        next && next(undefined, image);
    };
    image.onerror = function () {
        image.onload = image.onerror = image.onabort = undefined;
        next && next(new Error('Unable to load image.'));
    };
    image.src = source;
}
module.exports = exports['default'];
//# sourceMappingURL=atlas.js.map