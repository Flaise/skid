import {Avatar} from './avatar'

export class IconAvatar extends Avatar {
    constructor(container, icon, x, y, w, h) {
        super(container)
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.icon = icon
    }

    draw(context) {
        if(this.icon)
            this.icon.draw(context, this.x, this.y, this.w, this.h)
    }

    bounds() {
        if(!this.icon)
            return [this.x, this.y, 0, 0]
        return this.icon.bounds(this.x, this.y, this.w, this.h)
    }
}
