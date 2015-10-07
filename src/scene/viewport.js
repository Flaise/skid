import Group from './group'
import requestAnimationFrame from './request-animation-frame'

export default class Viewport extends Group {
    constructor(canvas) {
        super()
        this.canvas = canvas
        this.lastFrame = Date.now()
        this.animFrame = false
        
        this.animationFrame = () => {
            this.animFrame = false
            this.draw()
        }
        
        this.resize = () => this.changed()
        if(typeof window !== 'undefined') // for unit testing
            window.addEventListener('resize', this.resize)
    }
    
    subremove() {
        window.removeEventListener('resize', this.resize)
    }
    
    changed() {
        if(this.animFrame)
            return
        this.animFrame = true
        requestAnimationFrame(this.animationFrame)
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
