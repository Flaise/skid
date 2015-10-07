import Group from './group'

export default class Camera extends Group {
    constructor(group) {
        super(group)
        this.x = group.interpolands.make(0)
        this.y = group.interpolands.make(0)
        this.w = group.interpolands.make(0)
        this.h = group.interpolands.make(0)
        this.anchorX = group.interpolands.make(0)
        this.anchorY = group.interpolands.make(0)
        this.angle = group.interpolands.make(0)
    }
    
    subremove() {
        this.x.remove()
        this.y.remove()
        this.w.remove()
        this.h.remove()
        this.anchorX.remove()
        this.anchorY.remove()
        this.angle.remove()
    }
    
    draw(context) {
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
