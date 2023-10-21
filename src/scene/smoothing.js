import { Group } from './group';
import { isDefined } from '../is';

export class Smoothing extends Group {
    constructor(container, enabled) {
        super(container);
        this.enabled = enabled;
    }

    draw(context) {
        if (isDefined(this.enabled)) {
            context.save();
            context.imageSmoothingEnabled = this.enabled;
            context.mozImageSmoothingEnabled = this.enabled;
        }
        super.draw(context);
        if (isDefined(this.enabled)) {
            context.restore();
        }
    }
}
