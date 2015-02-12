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


/*
 * Turning off clearBeforeDraw can mitigate rendering artifacts caused by tiling alpha blended
 * background images.
 */
function Viewport(canvas, clearBeforeDraw) {
    sanity(canvas)
    sanity.constants(this, {
        interpolands: new Interpolands(),
        alive: new LinkedList(),
        canvas: canvas,
        onBeforeDraw: new EventDispatcher(),
        onAfterDraw: new EventDispatcher()
    })
    this.clearBeforeDraw = clearBeforeDraw
}
Viewport.prototype = Object.create(Group.prototype)
module.exports = exports = Viewport

Viewport.prototype.remove = undefined

Viewport.prototype.repeatDraw = function() {
    var _this = this
    function drawOnce() {
        _this.draw()
        requestAnimFrame(drawOnce)
    }
    requestAnimFrame(drawOnce)
}

Viewport.prototype.draw = function() {
    this.onBeforeDraw.proc()

    this.update()

    // Firefox bugs in some situations if context is reused
    var context = this.canvas.getContext('2d')

    if(this.clearBeforeDraw)
        context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    Group.prototype.draw.call(this, context)

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
