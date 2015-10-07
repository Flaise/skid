import DefaultAvatar from './default-avatar'

export default class IconAvatar extends DefaultAvatar {
    constructor(avatars, icon, w, h) {
        super(avatars)
        this.icon = icon
        if(w)
            this.w.setToInitial(w)
        if(h)
            this.h.setToInitial(h)
    }
    
    draw(context) {
        if(!this.icon)
            return
        context.save()
        this.doTransform(context, true)
        this.icon.draw(context, 0, 0, this.w.curr, this.h.curr)
        context.restore()
    }
}
