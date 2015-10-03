'use strict';

var sanity = require('./sanity');
var EventDispatcher = require('./eventdispatcher');
var Group = require('./group');

function Camera(avatars) {
    Group.call(this, avatars);
    sanity.constants(this, {
        x: avatars.interpolands.make(0),
        y: avatars.interpolands.make(0),
        w: avatars.interpolands.make(0),
        h: avatars.interpolands.make(0),
        anchorX: avatars.interpolands.make(0),
        anchorY: avatars.interpolands.make(0),
        angle: avatars.interpolands.make(0),
        onBeforeDraw: new EventDispatcher()
    });
    sanity.noAccess(this, 'avatars');
}
Camera.prototype = Object.create(Group.prototype);
module.exports = exports = Camera;

Camera.prototype.remove = function () {
    if (this.removed) return;
    this.x.remove();
    this.y.remove();
    this.w.remove();
    this.h.remove();
    this.anchorX.remove();
    this.anchorY.remove();
    this.angle.remove();
    Group.prototype.remove.call(this);
};

Camera.prototype.draw = function (context) {
    this.onBeforeDraw.proc();

    var canvas = context.canvas;

    context.save();
    context.scale(canvas.width / this.w.curr, canvas.height / this.h.curr);

    var dx = -this.x.curr + this.w.curr * this.anchorX.curr;
    var dy = -this.y.curr + this.h.curr * this.anchorY.curr;
    if (dx || dy) context.translate(dx, dy);

    Group.prototype.draw.call(this, context);

    context.restore();
};
//# sourceMappingURL=camera.js.map