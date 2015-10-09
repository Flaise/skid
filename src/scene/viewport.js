import Group from './group'
import requestAnimationFrame from './request-animation-frame'
import is from '../is'

export default class Viewport extends Group {
    constructor(canvas) {
        super()
        this._canvas = canvas
        this.lastFrame = undefined
        this.animFrame = false
        
        this.animationFrame = () => {
            this.animFrame = false
            this.draw()
            if(!this.animFrame)
                this.lastFrame = undefined
        }
        
        this.resize = () => this.changed()
        if(typeof window !== 'undefined') // for unit testing in Node
            window.addEventListener('resize', this.resize)
    }
    
    set canvas(value) {
        if(this._canvas === value)
            return
        this._canvas = value
        this.changed()
    }
    
    subremove() {
        window.removeEventListener('resize', this.resize)
    }
    
    changed() {
        if(this.animFrame)
            return
        if(is.nullish(this.lastFrame))
            this.lastFrame = Date.now()
        this.animFrame = true
        requestAnimationFrame(this.animationFrame)
    }
    
    draw() {
        if(!this._canvas)
            return
            
        const currentFrame = Date.now()
        this.interpolands.update(currentFrame - this.lastFrame)
        this.lastFrame = currentFrame
        
        super.draw(this._canvas.getContext('2d'))
    }
}
