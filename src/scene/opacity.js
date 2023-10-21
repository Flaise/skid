import { Group } from './group';
import { isDefined } from '../is';
import { makeInterpoland } from '../interpolands';

export class Opacity extends Group {
    constructor(state, group, alpha) {
        super(group);
        if (!isDefined(alpha)) {
            alpha = 1;
        }
        this.alpha = makeInterpoland(state, alpha);
    }

    draw(context) {
        if (this.empty || !this.alpha.curr) {
            return;
        }

        const prev = context.globalAlpha;
        if (prev !== this.alpha.curr) {
            context.globalAlpha = Math.min(1, Math.max(0, this.alpha.curr));
        }
        super.draw(context);
        if (prev !== this.alpha.curr) {
            context.globalAlpha = prev;
        }
    }

    subremove() {
        this.alpha.remove();
    }
}
