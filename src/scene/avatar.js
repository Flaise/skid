import is from '../is'

export default class Avatar {
    constructor(avatars) {
        this._layer = undefined
        this._node = avatars.alive.addLast(this)
    }
    
    get layer() {
        return this._layer
    }
    set layer(value) {
        // SANITY(!(this._avatars && this._avatars._iterating)) // TODO
        // SANITY(is.number(value))
        if(value === this._layer)
            return
        this._layer = value
        this._shift()
    }
    
    get removed() {
        return this._node.removed
    }
    remove() {
        this._node.remove()
    }
    
    draw(context) {
        console.warn('Called abstract function Avatar.draw().')
    }
    
    _shift() {
        // SANITY(!this.removed) // TODO
        
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
