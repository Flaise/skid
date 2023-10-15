import {Group} from './group'
import {is} from '../is'
import {makeInterpoland} from '../interpolands'

export class Scalement extends Group {
    constructor(state, container, w, h) {
        super(container)
        this.w = makeInterpoland(state, is.defined(w)? w: 1)
        this.h = makeInterpoland(state, is.defined(h)? h: 1)
    }

    draw(context) {
        if(this.empty || !this.w.curr || !this.h.curr)
            return

        if(this.w.curr !== 1 || this.h.curr !== 1)
            context.scale(this.w.curr, this.h.curr)

        super.draw(context)

        if(this.w.curr !== 1 || this.h.curr !== 1)
            context.scale(1 / this.w.curr, 1 / this.h.curr)
    }

    subremove() {
        this.w.remove()
        this.h.remove()
    }

    bounds() {
        console.warn('Not implemented') // TODO
    }

    static draw(context, w, h, impl) {
        if(!w || !h)
            return
        if(w !== 1 || h !== 1)
            context.scale(w, h)

        impl(context)

        if(w !== 1 || h !== 1)
            context.scale(1 / w, 1 / h)
    }
}
