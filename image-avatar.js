'use strict'

var DefaultAvatar = require('./default-avatar')
var sanity = require('./sanity')
var is = require('./is')


function ImageAvatar(avatars, icon, w, h) {
    DefaultAvatar.call(this, avatars)
    sanity.attribute(this, 'icon', icon, is.object.or.nullish)
    if(w)
        this.w.setToInitial(w)
    if(h)
        this.h.setToInitial(h)
}
ImageAvatar.prototype = Object.create(DefaultAvatar.prototype)
module.exports = exports = ImageAvatar

ImageAvatar.prototype.draw = function(context) {
    if(!this.icon)
        return
    context.save()
    this.doTransform(context, true)
    this.icon.draw(context, 0, 0, this.w.curr, this.h.curr)
    context.restore()
}
