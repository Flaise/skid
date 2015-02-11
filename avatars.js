'use strict'

var sanity = require('./sanity')
var Interpolands = require('./interpolands')
var LinkedList = require('./linkedlist')


function Avatars(interpolands) {
    if(sanity(interpolands))
        interpolands = new Interpolands()
    this.interpolands = interpolands
    this.alive = new LinkedList()
}
module.exports = exports = Avatars

Avatars.prototype.draw = function(context) {
    this.alive.forEach(function(avatar) {
        avatar.draw(context)
    })
}

