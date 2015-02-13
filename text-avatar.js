'use strict'

var Avatar = require('./avatar')
var sanity = require('./sanity')
var esquire = require('./index')


function TextAvatar(avatars, camera) {
    Avatar.call(this, avatars)
    sanity(camera)
    sanity.constants(this, {
        _interpolands: avatars.interpolands,
        x: avatars.interpolands.make(0),
        y: avatars.interpolands.make(0),
        opacity: avatars.interpolands.make(1),
        camera: camera
    })
    this.font = undefined
    this.text = ''
    this.textAlign = 'center' // center, left, right
    this.textBaseline = 'middle' // middle, top, bottom
    this.fillStyle = undefined // 'black'
    this.strokeStyle = undefined
    this.lineWidth = undefined
}
TextAvatar.prototype = Object.create(Avatar.prototype)
module.exports = exports = TextAvatar

TextAvatar.prototype.draw = function(context) {
    var canvas = context.canvas
    var cw = canvas.width
    var ch = canvas.height
    
    context.save()
    context.globalAlpha = esquire.clamp(this.opacity.curr, 0, 1)
    
    if(typeof(this.font) === 'function')
        context.font = this.font(cw, ch)
    else
        context.font = this.font
    
    if(this.x.curr || this.y.curr)
        context.translate(this.x.curr, this.y.curr)
    context.scale(1 / (cw / this.camera.w.curr),
                  1 / (ch / this.camera.h.curr))
    
    context.textAlign = this.textAlign
    context.textBaseline = this.textBaseline
    
    if(this.strokeStyle) {
        if(typeof(this.lineWidth) === 'function')
            context.lineWidth = this.lineWidth(cw, ch)
        else
            context.lineWidth = this.lineWidth
        context.strokeStyle = this.strokeStyle
        context.strokeText(this.text, 0, 0)
    }
    if(this.fillStyle) {
        context.fillStyle = this.fillStyle
        context.fillText(this.text, 0, 0)
    }
    
    context.restore()
}

TextAvatar.prototype.remove = function() {
    if(this.removed)
        return
    this.x.remove()
    this.y.remove()
    this.opacity.remove()
    this._avatar_remove()
}
