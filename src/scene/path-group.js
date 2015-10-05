import Group from './group'

export default class PathGroup extends Group {
    constructor(avatars) {
        super(avatars)
        this.fillStyle = undefined
        this.strokeStyle = undefined
        this.lineWidth = undefined
    }
    
    draw(context) {
        if(!this.alive.size || !(this.fillStyle || this.strokeStyle))
            return
        
        context.beginPath()
        
        super.draw(context)
        
        if(this.fillStyle) {
            context.fillStyle = this.fillStyle
            context.fill()
        }
        if(this.strokeStyle) {
            context.strokeStyle = this.strokeStyle
            context.lineWidth = this.lineWidth
            context.stroke()
        }
    }
}
