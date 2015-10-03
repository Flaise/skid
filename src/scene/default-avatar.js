import Avatar from './avatar'
import {toRadians} from '../turns'
import {clamp} from '../scalars'


export default class DefaultAvatar extends Avatar {
    constructor(avatars) {
        super(avatars)
        this.x = avatars.interpolands.make(0)
        this.y = avatars.interpolands.make(0)
        this.w = avatars.interpolands.make(0)
        this.h = avatars.interpolands.make(0)
        this.angle = avatars.interpolands.make(0)
        
        // TODO: use Opacity node
        this.opacity = avatars.interpolands.make(1)
        this.skipAlpha = undefined
    }
    
    doTransform(context) {
        if(this.x.curr || this.y.curr)
            context.translate(this.x.curr, this.y.curr)
        if(this.angle.curr)
            context.rotate(toRadians(this.angle.curr))
        // can't scale here; it breaks radii and strokes
        if(!this.skipAlpha) ////////// TODO: always use Opacity group
            context.globalAlpha = clamp(this.opacity.curr, 0, 1)
    }
    
    remove() {
        if(this.removed)
            return
        this.x.remove()
        this.y.remove()
        this.w.remove()
        this.h.remove()
        this.angle.remove()
        this.opacity.remove()
        super.remove()
    }
}
