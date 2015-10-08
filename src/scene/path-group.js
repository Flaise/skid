import Group from './group'

export default class PathGroup extends Group {
    constructor(container) {
        super(container)
        this.fillStyle = undefined
        this.strokeStyle = undefined
        this.lineWidth = undefined
    }
    
    draw(context) {
        if(this.empty || !(this.fillStyle || this.strokeStyle))
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
