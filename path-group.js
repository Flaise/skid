'use strict'

var sanity = require('./sanity')
var Group = require('./group')


function PathGroup(avatars, fillStyle, strokeStyle, lineWidth) {
    Group.call(this, avatars)
    this.fillStyle = fillStyle
    this.strokeStyle = strokeStyle
    this.lineWidth = lineWidth
}
PathGroup.prototype = Object.create(Group.prototype)
module.exports = exports = PathGroup

PathGroup.prototype.draw = function(context) {
    if(!this.alive.size || !(this.fillStyle || this.strokeStyle))
        return
    
    context.beginPath()
    
    Group.prototype.draw.call(this, context)
    
    if(this.fillStyle) {
        context.fillStyle = this.fillStyle
        context.fill()
    }
    if(this.strokeStyle) {
        context.strokeStyle = this.strokeStyle
        context.lineWidth = this.lineWidth
        context.stroke()
    }
}

