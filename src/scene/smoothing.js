import Group from './group'
import is from '../is'

export default class Smoothing extends Group {
    constructor(avatars) {
        super(avatars)
        this.enabled = false
    }
    
    draw(context) {
        if(is.defined(this.enabled)) {
            context.webkitImageSmoothingEnabled = this.enabled // TODO: is this needed on Chromium?
            context.imageSmoothingEnabled = this.enabled
            context.mozImageSmoothingEnabled = this.enabled
        }
        super.draw(context)
    }
}
