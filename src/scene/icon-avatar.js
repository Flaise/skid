import {Avatar} from './avatar'

export class IconAvatar extends Avatar {
    constructor(container, icon, x, y, w, h) {
        super(container)
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this._icon = icon
        this._add()
    }

    _add() {
        if(this._icon)
            this._icon.addAvatar(this)
    }
    _remove() {
        if(this._icon)
            this._icon.removeAvatar(this)
    }

    set icon(value) {
        if(this._icon === value)
            return
        this._remove()
        this._icon = value
        this._add()
        this.changed()
    }

    subremove() {
        this._remove()
    }

    draw(context) {
        if(this._icon)
            this._icon.draw(context, this.x, this.y, this.w, this.h)
    }

    bounds() {
        if(!this._icon)
            return [this.x, this.y, 0, 0]
        return this._icon.bounds(this.x, this.y, this.w, this.h)
    }
}
