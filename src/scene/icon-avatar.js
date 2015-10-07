import Avatar from './avatar'

export default class IconAvatar extends Avatar {
    constructor(container, icon) {
        super(container)
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
    
    drawi(context, x, y, w, h) {
        if(this._icon)
            this._icon.draw(context, x, y, w, h)
    }
    
    draw(context) {
        this.drawi(context, 0, 0, 1, 1)
    }
    
    bounds(x, y, w, h) {
        if(!this._icon)
            return [x, y, 0, 0]
        return this._icon.bounds(x, y, w, h)
    }
}
