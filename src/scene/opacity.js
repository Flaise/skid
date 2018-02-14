import {Group} from './group'
import {is} from '../is'

export class Opacity extends Group {
    constructor(group, alpha) {
        super(group)
        this.alpha = group.interpolands.make(is.defined(alpha)? alpha: 1)
    }

    draw(context) {
        if(this.empty || !this.alpha.curr)
            return

        const prev = context.globalAlpha
        if(prev !== this.alpha.curr)
            context.globalAlpha = this.alpha.curr
        super.draw(context)
        if(prev !== this.alpha.curr)
            context.globalAlpha = prev
    }

    subremove() {
        this.alpha.remove()
    }
}
