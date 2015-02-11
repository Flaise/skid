'use strict';
var Icon = require('./icon');
var Reactant = require('esquire/reactant');

var Atlas = (function () {
    function Atlas(layout) {
        this.layout = layout;
        Object.defineProperty(this, 'isLoaded', { value: new Reactant(false) });
        this.setSource(undefined, layout.image, undefined);
    }
    Atlas.prototype.makeIcon = function (name) {
        if (!name)
            return new Icon();

        var sprite = this.layout.sprites[name];

        if (!sprite) {
            console.warn('Icon "' + name + '" not found.');
            return new Icon();
        }

        if (!sprite.icon)
            sprite.icon = new Icon(this, sprite);
        return sprite.icon;
    };

    Atlas.prototype.iconExists = function (name) {
        return !!this.layout.sprites[name];
    };

    Atlas.prototype.setSource = function (_layout, _imageSource, next) {
        var _this = this;
        if (!next)
            next = function (err) {
                if (err)
                    console.error(err.stack || err);
            };

        this.isLoaded.value = false;

        loadImage(_imageSource, function (err, image) {
            if (err)
                return next(err);

            try  {
                if (_layout) {
                    Object.keys(_layout.sprites).forEach(function (spriteName) {
                        var newSprite = _layout.sprites[spriteName];
                        var oldSprite = _this.layout.sprites[spriteName];
                        if (!oldSprite) {
                            console.warn('New sprite "' + spriteName + '" has no old sprite.');
                            return;
                        }
                        var icon = oldSprite.icon;
                        if (icon) {
                            newSprite.icon = icon;
                            icon.data = newSprite;
                            if (icon._hFlip)
                                icon._hFlip.data = newSprite;
                            if (icon._vFlip)
                                icon._vFlip.data = newSprite;
                        }
                    });
                    _this.layout = _layout;
                }

                _this.image = image;

                _this.isLoaded.value = true;
                next(null);
            } catch (err) {
                next(err);
            }
        });
    };
    return Atlas;
})();

function loadImage(source, next) {
    if (!next)
        throw new Error();
    var image = new Image();
    image.onload = function () {
        image.onload = image.onerror = image.onabort = undefined;

        if (next)
            next(null, image);
    };
    image.onerror = function () {
        image.onload = image.onerror = image.onabort = undefined;

        if (next)
            next('Unable to load image.');
    };
    image.src = source;
}
module.exports = Atlas;
