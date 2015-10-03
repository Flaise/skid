'use strict';

var sanity = require('./sanity');
var Group = require('./group');

function Opacity(avatars, alpha) {
    Group.call(this, avatars);
    sanity.constants(this, {
        alpha: avatars.interpolands.make(alpha)
    });
}
Opacity.prototype = Object.create(Group.prototype);
module.exports = exports = Opacity;

Opacity.prototype.remove = function () {
    if (this.removed) return;
    this.alpha.remove();
    Group.prototype.remove.call(this);
};

Opacity.prototype.draw = function (context) {
    if (!this.alive.size || !this.alpha.curr) return;

    var prev = context.globalAlpha;
    if (prev !== this.alpha.curr) context.globalAlpha = this.alpha.curr;

    Group.prototype.draw.call(this, context);

    if (prev !== this.alpha.curr) context.globalAlpha = prev;
};
//# sourceMappingURL=opacity.js.map