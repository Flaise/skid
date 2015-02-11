'use strict'

var DefaultAvatar = require('./default-avatar')
var sanity = require('./sanity')


function RectAvatar(avatars) {
    DefaultAvatar.call(this, avatars)
    sanity.constants(this, {
        anchorX: avatars.interpolands.make(0),
        anchorY: avatars.interpolands.make(0)
    })
    this.fillStyle = undefined
    this.strokeStyle = undefined
    this.lineWidth = undefined
    this.radius = undefined
}
RectAvatar.prototype = Object.create(DefaultAvatar.prototype)
module.exports = exports = RectAvatar

RectAvatar.prototype.remove = function() {
    if(this.removed)
        return
    this._interpolands.remove([this.anchorX, this.anchorY])
    DefaultAvatar.prototype.remove.call(this)
}

RectAvatar.prototype.draw = function(context) {
    context.save()
    this.doTransform(context)
    if(this.anchorX.curr || this.anchorY.curr)
        context.translate(-this.w.curr * this.anchorX.curr, -this.h.curr * this.anchorY.curr)

    if(this.radius)
        doRoundRectPath(context, 0, 0, this.w.curr, this.h.curr, this.radius)

    if(this.fillStyle) {
        context.fillStyle = this.fillStyle
        if(this.radius)
            context.fill()
        else
            context.fillRect(0, 0, this.w.curr, this.h.curr)
    }
    if(this.strokeStyle) {
        context.strokeStyle = this.strokeStyle
        context.lineWidth = this.lineWidth
        if(this.radius)
            context.stroke()
        else
            context.strokeRect(0, 0, this.w.curr, this.h.curr)
    }

    context.restore()
}

function doRoundRectPath(context, x, y, w, h, radius) {
    context.beginPath()
    context.moveTo(x + radius, y)
    context.lineTo(x + w - radius, y)
    context.quadraticCurveTo(x + w, y, x + w, y + radius)
    context.lineTo(x + w, y + h - radius)
    context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    context.lineTo(x + radius, y + h)
    context.quadraticCurveTo(x, y + h, x, y + h - radius)
    context.lineTo(x, y + radius)
    context.quadraticCurveTo(x, y, x + radius, y)
    context.closePath()
}
