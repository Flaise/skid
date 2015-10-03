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
        if(is.nullish(this.lastFrame))
            this.lastFrame = Date.now()
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
    
    draw() {
        if(!this.canvas)
            return
            
        const context = this.canvas.getContext('2d')
        this.onBeforeDraw.proc(context)
        this.update()
        this.alive.forEach(avatar => avatar.draw(context))
        this.onAfterDraw.proc(context)
    }
    
    update() {
        const currentFrame = Date.now()
        this.interpolands.update(currentFrame - this.lastFrame)
        this.lastFrame = currentFrame
    }
}
