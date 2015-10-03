import Avatar from './avatar'
import is from '../is'

export default class TextAvatar extends Avatar {
    constructor(avatars, camera) {
        super(avatars)
        this._interpolands = avatars.interpolands
        this.x = avatars.interpolands.make(0)
        this.y = avatars.interpolands.make(0)
        this.opacity = avatars.interpolands.make(1)
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
        context.globalAlpha = esquire.clamp(this.opacity.curr, 0, 1)
        
        if(is.function(this.font))
            context.font = this.font(cw, ch)
        else
            context.font = this.font
        
        if(this.x.curr || this.y.curr)
            context.translate(this.x.curr, this.y.curr)
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
    
    remove() {
        if(this.removed)
            return
        this.x.remove()
        this.y.remove()
        this.opacity.remove()
        super.remove()
    }
}
