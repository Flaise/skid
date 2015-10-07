import Avatar from './avatar'
import is from '../is'

export default class Observer extends Avatar {
    constructor(avatars, target, onUpdate, onRemove) {
        super(avatars)
        
        if(is.function(target)) {
            onRemove = onUpdate
            onUpdate = target
            target = undefined
        }
        
        this.target = target
        this.onUpdate = onUpdate
        this.onRemove = onRemove
    }
    
    draw(context) {
        if(this.target && this.target.removed) {
            this.remove()
            this.onRemove && this.onRemove()
        }
        else {
            this.onUpdate && this.onUpdate(this.target)
        }
    }
    
    static BeforeAll(...args) {
        const result = new Observer(...args)
        result.layer = -Infinity
        return result
    }
    
    static AfterAll(...args) {
        const result = new Observer(...args)
        result.layer = Infinity
        return result
    }
}
