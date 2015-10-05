import Group from './group'

class Scalement extends Group {
    constructor(avatars, w, h) {
        super(avatars)
        this.w = avatars.interpolands.make(w)
        this.h = avatars.interpolands.make(h)
    }
    
    draw(context) {
        if(!this.alive.size || !this.w.curr || !this.h.curr)
            return
        
        if(this.w.curr !== 1 || this.h.curr !== 1)
            context.scale(this.w.curr, this.h.curr)
        
        super.draw(context)
        
        if(this.w.curr !== 1 || this.h.curr !== 1)
            context.scale(1 / this.w.curr, 1 / this.h.curr)
    }
    
    remove() {
        if(this.removed)
            return
        this.w.remove()
        this.h.remove()
        super.remove()
    }
}
