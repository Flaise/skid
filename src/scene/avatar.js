import is from '../is'

export default class Avatar {
    constructor(container) {
        this._layer = undefined
        this._removed = false
        this.container = container
        if(this.container) {
            this._node = this.container.alive.addLast(this)
            this.container.changed()
        }
        else {
            this._node = undefined
        }
    }
    
    get layer() {
        return this._layer
    }
    set layer(value) {
        if(value === this._layer)
            return
        this._layer = value
        this._shift()
    }
    
    get removed() {
        return this._removed
    }
    remove() {
        if(this.removed)
            return
        this._node && this._node.remove()
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
    
    _shift() {
        if(!this._node || is.nullish(this._layer))
            return
        
        while(true) {
            const prev = this._node.prev
            const prev_prev = prev.prev
            const next = this._node.next
            
            if(!prev.value)
                break
            if(is.defined(prev.value._layer) && prev.value._layer <= this._layer)
                break
            
            prev.next = next
            prev_prev.next = this._node
            prev.prev = this._node
        }
        
        while(true) {
            const prev = this._node.prev
            const next = this._node.next
            const next_next = next.next
            
            if(!next.value)
                break
            if(is.nullish(next.value._layer) || next.value._layer >= this._layer)
                break
            
            next.prev = prev
            next_next.prev = this._node
            next.next = this._node
        }
    }
}
