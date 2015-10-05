import EventDispatcher from '../event-dispatcher'
import Group from './group'

export default class Camera extends Group {
    constructor(avatars) {
        super(avatars)
        this.x = avatars.interpolands.make(0)
        this.y = avatars.interpolands.make(0)
        this.w = avatars.interpolands.make(0)
        this.h = avatars.interpolands.make(0)
        this.anchorX = avatars.interpolands.make(0)
        this.anchorY = avatars.interpolands.make(0)
        this.angle = avatars.interpolands.make(0)
        this.onBeforeDraw = new EventDispatcher()
    }
    
    remove() {
        if(this.removed)
            return
        this.x.remove()
        this.y.remove()
        this.w.remove()
        this.h.remove()
        this.anchorX.remove()
        this.anchorY.remove()
        this.angle.remove()
        super.remove()
    }
    
    draw(context) {
        this.onBeforeDraw.proc()

        const canvas = context.canvas

        context.save()
        context.scale(canvas.width / this.w.curr, canvas.height / this.h.curr)

        const dx = -this.x.curr + this.w.curr * this.anchorX.curr
        const dy = -this.y.curr + this.h.curr * this.anchorY.curr
        if (dx || dy)
            context.translate(dx, dy)

        super.draw(context)

        context.restore()
    }
}
