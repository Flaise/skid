'use strict';

var DefaultAvatar = require('./default-avatar');
var sanity = require('./sanity');
var esquire = require('./index');
var turns = require('./turns');

function PieAvatar(avatars) {
    DefaultAvatar.call(this, avatars);
    sanity.constants(this, {
        /*
         * Distance of second jaw from first jaw. Positive is clockwise.
         */
        breadth: avatars.interpolands.make(0),

        /*
         * Distance of first jaw from north. Positive is clockwise.
         */
        startAngle: avatars.interpolands.make(0),

        innerRadiusRel: avatars.interpolands.make(0)
    });
    this.fillStyle = undefined;
    this.strokeStyle = undefined;
    this.lineWidth = undefined;
}
PieAvatar.prototype = Object.create(DefaultAvatar.prototype);
module.exports = exports = PieAvatar;

PieAvatar.prototype.remove = function () {
    if (this.removed) return;
    this.breadth.remove();
    this.startAngle.remove();
    this.innerRadiusRel.remove();
    DefaultAvatar.prototype.remove.call(this);
};

PieAvatar.prototype.draw = function (context) {
    if (this.breadth.curr === 0) return;

    context.save();
    if (this.x.curr || this.y.curr) context.translate(this.x.curr, this.y.curr);
    if (this.angle.curr) context.rotate(turns.wrap(this.angle.curr));
    if (this.w.curr !== 1 || this.h.curr !== 1) context.scale(this.w.curr, this.h.curr);

    context.beginPath();

    if (this.breadth.curr >= 1) {
        context.arc(0, 0, .5, 0, Math.PI * 2, false);
    } else {
        var startAngle = this.startAngle.curr;
        var endAngle = startAngle + this.breadth.curr;

        startAngle = turns.toRadians(startAngle - .25);
        endAngle = turns.toRadians(endAngle - .25);

        context.arc(0, 0, .5 * this.innerRadiusRel.curr, endAngle, startAngle, this.breadth.curr >= 0);
        context.arc(0, 0, .5, startAngle, endAngle, this.breadth.curr < 0);
    }

    context.closePath();

    context.globalAlpha = esquire.clamp(this.opacity.curr, 0, 1);

    if (this.fillStyle) {
        context.fillStyle = this.fillStyle;
        context.fill();
    }
    if (this.strokeStyle) {
        context.strokeStyle = this.strokeStyle;
        context.lineWidth = this.lineWidth;
        context.stroke();
    }

    context.restore();
};
//# sourceMappingURL=pie-avatar.js.map