import { Group } from './group';
import { makeInterpoland } from '../interpolands';

export class Rotation extends Group {
    constructor(state, container, angle) {
        super(container);
        this.angle = makeInterpoland(state, angle || 0);
    }

    draw(context) {
        const radians = this.angle.curr * 2 * Math.PI;
        if (radians) {
            context.rotate(radians);
        }
        super.draw(context);
        if (radians) {
            context.rotate(-radians);
        }
    }

    subremove() {
        super.subremove();
        this.angle.remove();
    }

    bounds() {
        console.warn('Not implemented'); // TODO
    }
}
