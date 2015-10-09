import Avatar from './avatar'
import is from '../is'

export default class Observer extends Avatar {
    constructor(container, target, onUpdate, onRemove) {
        super(container)
        
        if(is.function(target)) {
            onRemove = onUpdate
            onUpdate = target
            target = undefined
        }
        
        this.target = target
        this.onUpdate = onUpdate
        this.onRemove = onRemove
    }
    
    subremove() {
        this.onRemove && this.onRemove(this.target, this)
    }
    
    draw(context) {
        if(this.target && this.target.removed)
            this.remove()
        else
            this.onUpdate && this.onUpdate(this.target, this)
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
    
    static CopyXY(root, source, target, onRemove) {
        return new Observer(root, source, (_, observer) => {
            if(target.removed) {
                observer.remove()
                return
            }
            // TODO: would be better without interpolands
            target.x.setTo(source.x.curr)
            target.y.setTo(source.y.curr)
        }, onRemove)
    }
}
