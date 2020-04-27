import {Group} from './group'
import {makeInterpoland} from '../interpolands'

export class Translation extends Group {
    constructor(state, container, x, y) {
        super(container)
        this.x = makeInterpoland(state, x || 0)
        this.y = makeInterpoland(state, y || 0)
    }

    draw(context) {
        if(!this.visible)
            return
        if(this.x.curr || this.y.curr)
            context.translate(this.x.curr, this.y.curr)
        super.draw(context)
        if(this.x.curr || this.y.curr)
            context.translate(-this.x.curr, -this.y.curr)
    }

    subremove() {
        super.subremove()
        this.x.remove()
        this.y.remove()
    }

    bounds() {
        console.warn('Not implemented') // TODO
    }

    static draw(context, x, y, impl) {
        if(x || y)
            context.translate(x, y)

        impl(context)

        if(x || y)
            context.translate(-x, -y)
    }
}
