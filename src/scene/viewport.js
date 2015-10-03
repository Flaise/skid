import EventDispatcher from '../event-dispatcher'
import is from '../is'
import Interpolands from '../interpolands'
import LinkedList from '../linked-list'


const requestAnimFrame = (
    window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(callback) { return window.setTimeout(callback, 1000 / 60) }
)

export default class Viewport {
    constructor(canvas) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.interpolands = new Interpolands()
        this.alive = new LinkedList()
        this.onBeforeDraw = new EventDispatcher()
        this.onAfterDraw = new EventDispatcher()
        this.lastFrame = undefined
        this.animFrame = false
    }
    
    changed() {
        if(this.animFrame)
            return
        requestAnimFrame(() => {
            this.animFrame = false
            this.draw()
        })
        this.animFrame = true
    }
    
    repeatDraw() {
        this.changed()
        this.onAfterDraw.listen(() => this.changed())
    }
    
    /*
     * Leaving this unused can mitigate rendering artifacts caused by tiling alpha blended
     * background images.
     */
    clearBeforeDraw() {
        return this.onBeforeDraw.listen(context => {
            context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        })
    }
    
    draw() {
        if(!this.canvas)
            return
        
        this.onBeforeDraw.proc(context)
        this.update()
        this.alive.forEach(avatar => avatar.draw(context))
        this.onAfterDraw.proc(context)
    }
    
    update() {
        const currentFrame = Date.now()
        if(is.nullish(this.lastFrame))
            this.interpolands.update(0)
        else
            this.interpolands.update(currentFrame - this.lastFrame)
        this.lastFrame = currentFrame
    }
}
