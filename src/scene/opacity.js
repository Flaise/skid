import Group from './group'

export default class Opacity extends Group {
    constructor(avatars, alpha) {
        super(avatars)
        this.alpha = avatars.interpolands.make(alpha)
    }
    
    draw(context) {
        if(!this.alive.size || !this.alpha.curr)
            return
        
        const prev = context.globalAlpha
        if(prev !== this.alpha.curr)
            context.globalAlpha = this.alpha.curr
        super.draw(context)
        if(prev !== this.alpha.curr)
            context.globalAlpha = prev
    }
    
    remove() {
        if(this.removed)
            return
        this.alpha.remove()
        super.remove()
    }
}
