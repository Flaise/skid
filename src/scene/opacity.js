import {Group} from './group'
import {is} from '../is'
import {makeInterpoland} from '../interpolands'

export class Opacity extends Group {
    constructor(state, group, alpha) {
        super(group)
        this.alpha = makeInterpoland(state, is.defined(alpha)? alpha: 1)
    }

    draw(context) {
        if(this.empty || !this.alpha.curr)
            return

        const prev = context.globalAlpha
        if(prev !== this.alpha.curr)
            context.globalAlpha = Math.max(1, Math.min(0, this.alpha.curr))
        super.draw(context)
        if(prev !== this.alpha.curr)
            context.globalAlpha = prev
    }

    subremove() {
        this.alpha.remove()
    }
}
