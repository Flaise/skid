import {DefaultAvatar} from './default-avatar'
import {wrap, toRadians} from '../turns'
import {clamp} from '../scalars'

export class PieAvatar extends DefaultAvatar {
    constructor(container) {
        super(container)
        // Distance of second jaw from first jaw. Positive is clockwise.
        this.breadth = container.interpolands.make(0)
        // Distance of first jaw from north. Positive is clockwise.
        this.startAngle = container.interpolands.make(0)
        this.innerRadiusRel = container.interpolands.make(0)
        this.fillStyle = undefined
        this.strokeStyle = undefined
        this.lineWidth = undefined
    }

    draw(context) {
        if(this.breadth.curr === 0)
            return

        context.save()
        if(this.x.curr || this.y.curr)
            context.translate(this.x.curr, this.y.curr)
        if(this.angle.curr)
            context.rotate(wrap(this.angle.curr))
        if(this.w.curr !== 1 || this.h.curr !== 1)
            context.scale(this.w.curr, this.h.curr)

        context.beginPath()

        if(this.breadth.curr >= 1) {
            context.arc(0, 0, .5, 0, Math.PI * 2, false)
        }
        else {
            var startAngle = this.startAngle.curr
            var endAngle = startAngle + this.breadth.curr

            startAngle = toRadians(startAngle - .25)
            endAngle = toRadians(endAngle - .25)

            context.arc(0, 0, .5 * this.innerRadiusRel.curr, endAngle, startAngle,
                        this.breadth.curr >= 0)
            context.arc(0, 0, .5, startAngle, endAngle, this.breadth.curr < 0)
        }

        context.closePath()

        context.globalAlpha = clamp(this.opacity.curr, 0, 1)

        if(this.fillStyle) {
            context.fillStyle = this.fillStyle
            context.fill()
        }
        if(this.strokeStyle) {
            context.strokeStyle = this.strokeStyle
            context.lineWidth = this.lineWidth
            context.stroke()
        }

        context.restore()
    }

    subremove() {
        this.breadth.remove()
        this.startAngle.remove()
        this.innerRadiusRel.remove()
    }
}
