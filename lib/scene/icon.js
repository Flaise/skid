'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Icon = (function () {
    function Icon(atlas) {
        _classCallCheck(this, Icon);

        this.atlas = atlas;
        this._hFlip = undefined;
        this._vFlip = undefined;
        this.flipX = 1;
        this.flipY = 1;
    }

    // TODO: flippedHorizontally().flippedVertically().flippedHorizontally().flippedVertically()
    //       does not return original

    _createClass(Icon, [{
        key: 'flippedHorizontally',
        value: function flippedHorizontally() {
            if (!this._hFlip) {
                this._hFlip = new Icon(this.atlas);
                this._hFlip.flipX = -this.flipX;
                this._hFlip._hFlip = this;
            }
            return this._hFlip;
        }
    }, {
        key: 'draw',
        value: function draw(context, x, y, w, h) {
            if (!this.atlas) return;else if (!this.atlas.image) return;else if (w === 0 || h === 0) return;else if (!w || !h) console.warn('Invalid destination size ' + w + ', ' + h);else if (!this.atlas.image.width || !this.atlas.image.height) return; // if missing, Firefox throws and Chrome (sometimes?) has performance issues

            var data = this.atlas.sprites[this.name];
            if (!data) return;
            if (data.solid) {
                if (this.flipX !== 1 || this.flipY !== 1) {
                    ////////////////////////////////////// TODO: precompute flipped atlas
                    context.save();
                    context.scale(this.flipX, this.flipY);
                }
                context.drawImage(this.atlas.image, data.x, data.y, data.w, data.h, this.flipX * x - data.axRel * w * data.sx, this.flipY * y - data.ayRel * h * data.sy, w * data.sx, h * data.sy);
                if (this.flipX !== 1 || this.flipY !== 1) {
                    context.restore();
                }
            } else {
                if (this.flipX !== 1 || this.flipY !== 1) {
                    context.save();
                    context.scale(this.flipX, this.flipY);
                }
                context.drawImage(this.atlas.image, data.x, data.y, data.w, data.h, this.flipX * x + (data.insetXRel - data.axRel) * w * data.sx, this.flipY * y + (data.insetYRel - data.ayRel) * h * data.sy, (w + data.insetWRel * w) * data.sx, (h + data.insetHRel * h) * data.sy);
                if (this.flipX !== 1 || this.flipY !== 1) {
                    context.restore();
                }
            }
        }

        /*
         * Returns an [x, y, w, h] array of rectangle bounds that specify the area of the canvas that
         * will be taken up when this icon is drawn on a tile of the dimensions given.
         */
    }, {
        key: 'bounds',
        value: function bounds(x, y, w, h) {
            var data = this.atlas.sprites[this.name];
            if (!data) return [0, 0, 0, 0];
            if (data.solid) return [x - data.axRel * w * data.sx, y - data.ayRel * h * data.sy, w * data.sx, h * data.sy];else return [x + (data.insetXRel - data.axRel) * w * data.sx, y + (data.insetYRel - data.ayRel) * h * data.sy, (w + data.insetWRel * w) * data.sx, (h + data.insetHRel * h) * data.sy];
        }
    }]);

    return Icon;
})();

exports['default'] = Icon;
var blank = new Icon();
exports.blank = blank;
//# sourceMappingURL=icon.js.map