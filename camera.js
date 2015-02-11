'use strict';
var Avatars = require('./avatars');
var sanity = require('./sanity');
var Interpolands = require('./interpolands');
var EventDispatcher = require('./eventdispatcher');

var Camera = (function () {
    function Camera(avatars) {
        sanity.constants(this, {
            avatars: avatars,
            x: avatars.interpolands.make(0),
            y: avatars.interpolands.make(0),
            w: avatars.interpolands.make(0),
            h: avatars.interpolands.make(0),
            anchorX: avatars.interpolands.make(0),
            anchorY: avatars.interpolands.make(0),
            angle: avatars.interpolands.make(0),
            onBeforeDraw: new EventDispatcher()
        });
    }
    Camera.prototype.draw = function (context) {
        this.onBeforeDraw.proc();

        var canvas = context.canvas;

        context.save();
        context.scale(canvas.width / this.w.curr, canvas.height / this.h.curr);

        var dx = -this.x.curr + this.w.curr * this.anchorX.curr;
        var dy = -this.y.curr + this.h.curr * this.anchorY.curr;
        if (dx || dy)
            context.translate(dx, dy);

        this.avatars.draw(context);

        context.restore();
    };
    return Camera;
})();
module.exports = Camera;
