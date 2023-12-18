import { Group } from './group.js';
import { isDefined } from '../is.js';
import { makeInterpoland } from '../interpolands.js';

export class Opacity extends Group {
    constructor(state, group, alpha) {
        super(group);
        if (!isDefined(alpha)) {
            alpha = 1;
        }
        this.alpha = makeInterpoland(state, alpha);
    }

    draw(context) {
        if (this.empty) {
            return;
        }

        const prev = context.globalAlpha;
        const target = Math.min(1, Math.max(0, this.alpha.curr * prev));
        if (target === 0) {
            return;
        }

        if (prev !== target) {
            context.globalAlpha = target;
        }
        super.draw(context);
        if (prev !== target) {
            context.globalAlpha = prev;
        }
    }

    subremove() {
        this.alpha.remove();
    }
}
