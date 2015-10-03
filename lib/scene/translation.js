'use strict';

var sanity = require('./sanity');
var Group = require('./group');

function Translation(avatars, x, y) {
    Group.call(this, avatars);
    sanity.constants(this, {
        _interpolands: avatars.interpolands,
        x: avatars.interpolands.make(x),
        y: avatars.interpolands.make(y)
    });
    this._copyOf = undefined;
}
Translation.prototype = Object.create(Group.prototype);
module.exports = exports = Translation;

Translation.prototype.remove = function () {
    if (this.removed) return;
    this.x.remove();
    this.y.remove();
    Group.prototype.remove.call(this);
};

Translation.prototype.draw = function (context) {
    if (this._copyOf) {
        if (this._copyOf.removed) {
            if (this._autoDelete) {
                this.remove();
                return;
            } else {
                this._copyOf = undefined;
            }
        } else {
            // TODO: reference-counted interpolands?
            this.x.setToInitial(this._copyOf.x.curr);
            this.y.setToInitial(this._copyOf.y.curr);
        }
    }
    if (!this.alive.size) return;
    context.translate(this.x.curr, this.y.curr);
    Group.prototype.draw.call(this, context);
    context.translate(-this.x.curr, -this.y.curr);
};

Translation.prototype.copy = function (avatars, autoDelete) {
    var result = new Translation(avatars, this.x.curr, this.y.curr);
    result._copyOf = this;
    result._autoDelete = autoDelete;
    return result;
};
//# sourceMappingURL=translation.js.map