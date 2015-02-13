'use strict'

var sanity = require('./sanity')
var LinkedList = require('./linkedlist')
var Avatar = require('./avatar')


function Group(avatars) {
    Avatar.call(this, avatars)
    sanity.constants(this, {
        interpolands: avatars.interpolands, // used when adding avatars to this group
        alive: new LinkedList()
    })
}
Group.prototype = Object.create(Avatar.prototype)
module.exports = exports = Group

Group.prototype.draw = function(context) {
    this.alive.forEach(function(avatar) {
        avatar.draw(context)
    })
}

Group.prototype.remove = function() {
    if(this.removed)
        return
    this.alive.forEach(function(avatar) {
        avatar.remove()
    })
    Avatar.prototype.remove.call(this)
}

