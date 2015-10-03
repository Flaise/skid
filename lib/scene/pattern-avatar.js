'use strict';

var DefaultAvatar = require('./default-avatar');
var sanity = require('./sanity');
var is = require('./is');

function PatternAvatar(avatars, camera, icon, parallaxFactor) {
    DefaultAvatar.call(this, avatars);
    sanity(icon);
    this.camera = camera;
    this.parallaxX = parallaxFactor;
    this.parallaxY = parallaxFactor;
    this.icon = icon;
}
PatternAvatar.prototype = Object.create(DefaultAvatar.prototype);
module.exports = exports = PatternAvatar;

PatternAvatar.prototype.draw = function (context) {
    if (sanity(this.icon)) return;

    if (this.opacity.curr !== 1) {
        var prevGlobalAlpha = context.globalAlpha;
        context.globalAlpha = esquire.clamp(this.opacity.curr, 0, 1);
    }

    var cameraLeft = this.camera.x.curr - this.camera.w.curr * this.camera.anchorX.curr;
    var cameraRight = this.camera.x.curr + this.camera.w.curr * (1 - this.camera.anchorX.curr);
    var w = this.w.curr;
    if (sanity(w > 0)) return;
    var startX = this.x.curr - w;
    startX += this.camera.x.curr * this.parallaxX - this.parallaxX;
    while (startX + w < cameraLeft) startX += w;
    while (startX > cameraLeft) startX -= w;

    var cameraTop = this.camera.y.curr - this.camera.h.curr * this.camera.anchorY.curr;
    var cameraBottom = this.camera.y.curr + this.camera.h.curr * (1 - this.camera.anchorY.curr);
    var h = this.h.curr;
    if (sanity(h > 0)) return;
    var startY = this.y.curr - h;
    startY += this.camera.y.curr * this.parallaxY - this.parallaxY;
    while (startY + h < cameraTop) startY += h;
    while (startY > cameraTop) startY -= h;

    for (var y = startY; y < cameraBottom; y += h) for (var x = startX; x < cameraRight; x += w) this.icon.draw(context, x + w / 2, y + h / 2, w, h);

    if (prevGlobalAlpha !== undefined) context.globalAlpha = prevGlobalAlpha;
};
//# sourceMappingURL=pattern-avatar.js.map