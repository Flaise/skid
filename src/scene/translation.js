import Group from './group'

export default class Translation extends Group {
    constructor(avatars, x, y) {
        super(avatars)
        this.x = avatars.interpolands.make(x)
        this.y = avatars.interpolands.make(y)
    }
    
    draw(context) {
        if(this.x.curr || this.y.curr)
            context.translate(this.x.curr, this.y.curr)
        super.draw(context)
        if(this.x.curr || this.y.curr)
            context.translate(-this.x.curr, -this.y.curr)
    }
    
    remove() {
        if(this.removed)
            return
        this.x.remove()
        this.y.remove()
        super.remove()
    }
}
