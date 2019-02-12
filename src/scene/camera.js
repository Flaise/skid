import {Group} from './group'
import {makeInterpoland} from '../interpolands'

export class Camera extends Group {
    constructor(state, group) {
        super(group)
        this.x = makeInterpoland(state, 0)
        this.y = makeInterpoland(state, 0)
        this.w = makeInterpoland(state, 0)
        this.h = makeInterpoland(state, 0)
        this.anchorX = makeInterpoland(state, 0)
        this.anchorY = makeInterpoland(state, 0)
        this.angle = makeInterpoland(state, 0)
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
        if(dx || dy)
            context.translate(dx, dy)

        super.draw(context)

        context.restore()
    }
}
