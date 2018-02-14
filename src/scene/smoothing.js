import {Group} from './group'
import {is} from '../is'

export class Smoothing extends Group {
    constructor(container, enabled) {
        super(container)
        this.enabled = enabled
    }

    draw(context) {
        if(is.defined(this.enabled)) {
            context.save()
            context.imageSmoothingEnabled = this.enabled
            context.mozImageSmoothingEnabled = this.enabled
        }
        super.draw(context)
        if(is.defined(this.enabled)) {
            context.restore()
        }
    }
}
