'use strict'

var sanity = require('./sanity')
var Group = require('./group')


function Scalement(avatars, w, h) {
    Group.call(this, avatars)
    sanity.constants(this, {
        _interpolands: avatars.interpolands,
        w: avatars.interpolands.make(w),
        h: avatars.interpolands.make(h)
    })
    this._copyOf = undefined
}
Scalement.prototype = Object.create(Group.prototype)
module.exports = exports = Scalement

Scalement.prototype.remove = function() {
    if(this.removed)
        return
    this._interpolands.remove([this.w, this.h])
    Group.prototype.remove.call(this)
}

Scalement.prototype.draw = function(context) {
    if(!this.alive.size || !this.w.curr || !this.h.curr)
        return
    
    if(this.w.curr !== 1 || this.h.curr !== 1)
        context.scale(this.w.curr, this.h.curr)
    
    Group.prototype.draw.call(this, context)
    
    if(this.w.curr !== 1 || this.h.curr !== 1)
        context.scale(1 / this.w.curr, 1 / this.h.curr)
}
