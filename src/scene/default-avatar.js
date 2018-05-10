import {Avatar} from './avatar'
import {toRadians} from '../turns'
import {clamp} from '../scalars'

export class DefaultAvatar extends Avatar {
    constructor(group) {
        super(group)
        this.x = group.interpolands.make(0)
        this.y = group.interpolands.make(0)
        this.w = group.interpolands.make(0)
        this.h = group.interpolands.make(0)
        this.angle = group.interpolands.make(0)
    }

    doTransform(context) {
        if(this.x.curr || this.y.curr)
            context.translate(this.x.curr, this.y.curr)
        if(this.angle.curr)
            context.rotate(toRadians(this.angle.curr))
        // can't scale here; it breaks radii and strokes
    }

    subremove() {
        this.x.remove()
        this.y.remove()
        this.w.remove()
        this.h.remove()
        this.angle.remove()
        this.opacity.remove()
    }
}
