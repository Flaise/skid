import Observer from './observer'
import Group from './group'
import is from '../is'
import requestAnimationFrame from './request-animation-frame'

export default class Viewport extends Group {
    constructor(canvas) {
        super()
        this.canvas = canvas
        this.lastFrame = undefined
        this.animFrame = false
    }
    
    changed() {
        if(this.animFrame)
            return
        if(is.nullish(this.lastFrame))
            this.lastFrame = Date.now()
        requestAnimationFrame(() => {
            this.animFrame = false
            this.draw()
        })
        this.animFrame = true
    }
    
    draw() {
        if(!this.canvas)
            return
            
        const currentFrame = Date.now()
        this.interpolands.update(currentFrame - this.lastFrame)
        this.lastFrame = currentFrame
        
        super.draw(this.canvas.getContext('2d'))
    }
}
