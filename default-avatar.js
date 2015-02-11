'use strict'

var sanity = require('./sanity')
var Avatar = require('./avatar')
var EventDispatcher = require('./eventdispatcher')
var is = require('./is')
var esquire = require('./index')
var turns = require('./turns')


function DefaultAvatar(avatars) {
    Avatar.call(this, avatars)
    sanity.constants(this, {
        _interpolands: avatars.interpolands,
        x: avatars.interpolands.make(0),
        y: avatars.interpolands.make(0),
        w: avatars.interpolands.make(0),
        h: avatars.interpolands.make(0),
        angle: avatars.interpolands.make(0),
        opacity: avatars.interpolands.make(1)
    })
}
DefaultAvatar.prototype = Object.create(Avatar.prototype)
module.exports = exports = DefaultAvatar

DefaultAvatar.prototype.doTransform = function(context) {
    if(this.x.curr || this.y.curr)
        context.translate(this.x.curr, this.y.curr)
    if(this.angle.curr)
        context.rotate(turns.toRadians(this.angle.curr))
    // can't scale here; it breaks radii and strokes
    context.globalAlpha = esquire.clamp(this.opacity.curr, 0, 1)
}

DefaultAvatar.prototype._defaultAvatar_remove = function() {
    if(this.removed)
        return
    this._interpolands.remove([this.x, this.y, this.w, this.h, this.angle, this.opacity])
    Avatar.prototype.remove.call(this)
}
DefaultAvatar.prototype.remove = DefaultAvatar.prototype._defaultAvatar_remove
