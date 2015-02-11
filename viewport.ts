'use strict'

declare var window:any
var LinkedList = require('./linkedlist')
var EventDispatcher = require('./eventdispatcher')
var Camera = require('./camera')
var is = require('./is')
var Interpolands = require('./interpolands')
var Avatars = require('./avatars')
var sanity = require('./sanity')


var onAnimFrame = (function() {
    var requestAnimFrame = (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        (callback => window.setTimeout(callback, 1000 / 60))
    )
    var dispatcher = new EventDispatcher()
    dispatcher.listen(requestAnimFrame.bind(undefined, () => dispatcher.proc()))
    dispatcher.proc()
    return dispatcher
})()


class Viewport {
    cameras = new LinkedList()
    interpolands = new Interpolands()
    lastFrame
    onBeforeDraw = new EventDispatcher()
    onAfterDraw = new EventDispatcher()
    
    /*
     * Turning off clearBeforeDraw can mitigate rendering artifacts caused by tiling alpha blended
     * background images.
     */
    constructor(public canvas, public clearBeforeDraw) {
        sanity(this.canvas)
    }
    
    makeCamera() {
        var camera = new Camera(new Avatars(this.interpolands))
        this.cameras.addLast(camera)
        return camera
    }
    
    repeatDraw() {
        return onAnimFrame.listen(() => this.draw())
    }
    
    draw() {
        this.onBeforeDraw.proc()
        
        this.update()
        
        // Firefox bugs in some situations if context is reused
        var context = this.canvas.getContext('2d')
        
        if(this.clearBeforeDraw)
            context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.cameras.forEach(camera => camera.draw(context))
        
        this.onAfterDraw.proc()
    }
    
    update() {
        if(is.nullish(this.lastFrame))
            this.lastFrame = Date.now()
        
        var currentFrame = Date.now()
        var dt = currentFrame - this.lastFrame
        this.lastFrame = currentFrame
        this.interpolands.update(dt)
    }
}
export = Viewport
