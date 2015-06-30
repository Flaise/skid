'use strict';
var Reactant = require('./reactant');

var alwaysLoaded = new Reactant(true);

var Icon = (function () {
    function Icon(atlas, data) {
        this.atlas = atlas;
        this.data = data;
        this.flipX = 1;
        this.flipY = 1;
        this.isLoaded = this.atlas ? this.atlas.isLoaded : alwaysLoaded;
    }
    // TODO: flippedHorizontally().flippedVertically().flippedHorizontally().flippedVertically()
    //       does not return original
    Icon.prototype.flippedHorizontally = function () {
        if (!this._hFlip) {
            this._hFlip = new Icon(this.atlas, this.data);
            this._hFlip.flipX = -this.flipX;
            this._hFlip._hFlip = this;
        }
        return this._hFlip;
    };

    Icon.prototype.draw = function (context, x, y, w, h) {
        if (!this.atlas)
            return;
        else if (!this.atlas.image)
            return;
        else if (w === 0 || h === 0)
            return;
        else if (!w || !h)
            console.warn('Invalid destination size ' + w + ', ' + h);
        else if (!this.atlas.image.width || !this.atlas.image.height)
            return;
        else if (this.data.solid) {
            if ((this.flipX !== 1) || (this.flipY !== 1)) {
                ////////////////////////////////////// TODO: precompute flipped atlas
                context.save();
                context.scale(this.flipX, this.flipY);
            }
            context.drawImage(this.atlas.image, this.data.x, this.data.y, this.data.w, this.data.h, this.flipX * x - this.data.axRel * w * this.data.sx, this.flipY * y - this.data.ayRel * h * this.data.sy, w * this.data.sx, h * this.data.sy);
            if ((this.flipX !== 1) || (this.flipY !== 1)) {
                context.restore();
            }
        } else {
            if ((this.flipX !== 1) || (this.flipY !== 1)) {
                context.save();
                context.scale(this.flipX, this.flipY);
            }
            context.drawImage(this.atlas.image, this.data.x, this.data.y, this.data.w, this.data.h, this.flipX * x + (this.data.insetXRel - this.data.axRel) * w * this.data.sx, this.flipY * y + (this.data.insetYRel - this.data.ayRel) * h * this.data.sy, (w + this.data.insetWRel * w) * this.data.sx, (h + this.data.insetHRel * h) * this.data.sy);
            if ((this.flipX !== 1) || (this.flipY !== 1)) {
                context.restore();
            }
        }
    };

    /*
    * Returns an [x, y, w, h] array of rectangle bounds that specify the area of the canvas that
    * will be taken up when this icon is drawn on a tile of the dimensions given.
    */
    Icon.prototype.bounds = function (x, y, w, h) {
        if (this.data.solid)
            return [
                x - this.data.axRel * w * this.data.sx, y - this.data.ayRel * h * this.data.sy,
                w * this.data.sx, h * this.data.sy];
        else
            return [
                x + (this.data.insetXRel - this.data.axRel) * w * this.data.sx,
                y + (this.data.insetYRel - this.data.ayRel) * h * this.data.sy,
                (w + this.data.insetWRel * w) * this.data.sx,
                (h + this.data.insetHRel * h) * this.data.sy];
    };
    return Icon;
})();
module.exports = Icon;
