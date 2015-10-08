import Avatar from './avatar'
import is from '../is'

export default class TextAvatar extends Avatar {
    constructor(container, camera) {
        super(container)
        this.camera = camera
        this.font = undefined
        this.text = ''
        this.textAlign = 'center' // options: center, left, right
        this.textBaseline = 'middle' // options: middle, top, bottom
        this.fillStyle = undefined // example: 'black'
        this.strokeStyle = undefined
        this.lineWidth = undefined
    }
    
    draw(context) {
        const canvas = context.canvas
        const cw = canvas.width
        const ch = canvas.height
        
        context.save()
        
        if(is.function(this.font))
            context.font = this.font(cw, ch)
        else
            context.font = this.font
        
        context.scale(1 / (cw / this.camera.w.curr),
                      1 / (ch / this.camera.h.curr))
        
        context.textAlign = this.textAlign
        context.textBaseline = this.textBaseline
        
        if(this.strokeStyle) {
            if(is.function(this.lineWidth))
                context.lineWidth = this.lineWidth(cw, ch)
            else
                context.lineWidth = this.lineWidth
            context.strokeStyle = this.strokeStyle
            context.strokeText(this.text, 0, 0)
        }
        if(this.fillStyle) {
            context.fillStyle = this.fillStyle
            context.fillText(this.text, 0, 0)
        }
        
        context.restore()
    }
}
