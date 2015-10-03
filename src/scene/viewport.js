'use strict'

var EventDispatcher = require('./eventdispatcher')
var is = require('./is')
var Interpolands = require('./interpolands')
var Group = require('./group')
var sanity = require('./sanity')
var LinkedList = require('./linkedlist')


var requestAnimFrame = (
    window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(callback) { return window.setTimeout(callback, 1000 / 60) }
)


function Viewport(canvas) {
    sanity(canvas)
    sanity.constants(this, {
        interpolands: new Interpolands(),
        alive: new LinkedList(),
        canvas: canvas,
        onBeforeDraw: new EventDispatcher(),
        onAfterDraw: new EventDispatcher()
    })
}
module.exports = exports = Viewport

Viewport.prototype.repeatDraw = function() {
    var _this = this
    function drawOnce() {
        _this.draw()
        requestAnimFrame(drawOnce)
    }
    requestAnimFrame(drawOnce)
}

/*
 * Leaving this unused can mitigate rendering artifacts caused by tiling alpha blended
 * background images.
 */
Viewport.prototype.clearBeforeDraw = function() {
    var _this = this
    return this.onBeforeDraw.listen(function(context) {
        context.clearRect(0, 0, _this.canvas.width, _this.canvas.height)
    })
}

Viewport.prototype.draw = function() {
    if(!this.canvas)
        return
    
    // Firefox bugs in some situations if context is reused
    var context = this.canvas.getContext('2d')
    
    this.onBeforeDraw.proc(context)
    this.update()
    this.alive.forEach(function(avatar) {
        avatar.draw(context)
    })
    this.onAfterDraw.proc()
}

Viewport.prototype.update = function() {
    if(is.nullish(this.lastFrame))
        this.lastFrame = Date.now()

    var currentFrame = Date.now()
    var dt = currentFrame - this.lastFrame
    this.lastFrame = currentFrame
    
    this.interpolands.update(dt)
}
