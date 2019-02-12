export class Avatar {
    constructor(container) {
        this._layer = undefined
        this.removed = false
        if(container)
            container.insert(this)
        else
            this.container = undefined
    }

    get layer() {
        return this._layer
    }
    set layer(value) {
        if(value === this._layer)
            return
        this._layer = value
        if(this.container)
            this.container.resort(this)
    }

    remove() {
        if(this.removed)
            return
        this.removed = true
        if(this.container)
            this.container.removeAvatar(this)
        this.subremove()
    }
    subremove() {}

    draw(context) {
        console.warn('Called abstract function Avatar.draw()')
    }

    walk(callback) {
        callback(this)
    }

    bounds() {
        return undefined
    }
}
