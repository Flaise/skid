import is from '../is'
import {insertSorted, remove} from '../array'

function compare(a, b) {
    if(is.nullish(a._layer))
        return -1
    if(is.nullish(b._layer))
        return 1
    return b._layer - a._layer
}

export default class Avatar {
    constructor(container) {
        this._layer = undefined
        this._removed = false
        this.container = container
        if(container) {
            insertSorted(container.contents, this, compare)
            container.changed()
        }
    }
    
    get layer() {
        return this._layer
    }
    set layer(value) {
        if(value === this._layer)
            return
        this._layer = value
        if(this.container) {
            // TODO: This can probably be optimized to not shift the contents of the array twice.
            remove(this.container.contents, this)
            insertSorted(this.container.contents, this, compare)
            
            this.container.changed()
        }
        this.changed()
    }
    
    get removed() {
        return this._removed
    }
    remove() {
        if(this._removed)
            return
        this._removed = true
        if(this.container)
            remove(this.container.contents, this)
        this.subremove()
        this.changed()
    }
    subremove() {}
    
    draw(context) {
        console.warn('Called abstract function Avatar.draw()')
    }
    
    walk(callback) {
        callback(this)
    }
    
    changed() {
        if(this.container)
            this.container.changed()
    }
    
    bounds() {
        return undefined
    }
}
