import {Avatar} from './avatar'
import {makeInterpoland} from '../interpolands'
import {toRadians} from '../turns'

export class RectAvatar extends Avatar {
    constructor(state, container) {
        super(container)
        this.x = makeInterpoland(state, 0)
        this.y = makeInterpoland(state, 0)
        this.w = makeInterpoland(state, 0)
        this.h = makeInterpoland(state, 0)
        this.angle = makeInterpoland(state, 0)
        this.anchorX = makeInterpoland(state, 0)
        this.anchorY = makeInterpoland(state, 0)
        this.fillStyle = undefined
        this.strokeStyle = undefined
        this.lineWidth = undefined
        this.radius = undefined
    }

    draw(context) {
        if (!this.w.curr || !this.h.curr)
            return

        context.save()
        if(this.x.curr || this.y.curr)
            context.translate(this.x.curr, this.y.curr)
        if(this.angle.curr)
            context.rotate(toRadians(this.angle.curr))
        if(this.anchorX.curr || this.anchorY.curr)
            context.translate(-this.w.curr * this.anchorX.curr, -this.h.curr * this.anchorY.curr)

        if(this.radius)
            doRoundRectPath(context, 0, 0, this.w.curr, this.h.curr, this.radius)

        if(this.fillStyle) {
            context.fillStyle = this.fillStyle
            if(this.radius)
                context.fill()
            else
                context.fillRect(0, 0, this.w.curr, this.h.curr)
        }
        if(this.strokeStyle) {
            context.strokeStyle = this.strokeStyle
            context.lineWidth = this.lineWidth
            if(this.radius)
                context.stroke()
            else
                context.strokeRect(0, 0, this.w.curr, this.h.curr)
        }

        context.restore()
    }

    subremove() {
        this.x.remove()
        this.y.remove()
        this.w.remove()
        this.h.remove()
        this.angle.remove()
        this.anchorX.remove()
        this.anchorY.remove()
    }
}

function doRoundRectPath(context, x, y, w, h, radius) {
    context.beginPath()
    context.moveTo(x + radius, y)
    context.lineTo(x + w - radius, y)
    context.quadraticCurveTo(x + w, y, x + w, y + radius)
    context.lineTo(x + w, y + h - radius)
    context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    context.lineTo(x + radius, y + h)
    context.quadraticCurveTo(x, y + h, x, y + h - radius)
    context.lineTo(x, y + radius)
    context.quadraticCurveTo(x, y, x + radius, y)
    context.closePath()
}
