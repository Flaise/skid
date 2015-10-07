import Group from './group'

export default class Translation extends Group {
    constructor(container, x, y) {
        super(container)
        this.x = this.interpolands.make(x || 0)
        this.y = this.interpolands.make(y || 0)
    }
    
    draw(context) {
        if(this.x.curr || this.y.curr)
            context.translate(this.x.curr, this.y.curr)
        super.draw(context)
        if(this.x.curr || this.y.curr)
            context.translate(-this.x.curr, -this.y.curr)
    }
    
    subremove() {
        this.x.remove()
        this.y.remove()
    }
    
    static draw(context, x, y, impl) {
        if(x || y)
            context.translate(x, y)
        
        impl(context)
        
        if(x || y)
            context.translate(-x, -y)
    }
}
