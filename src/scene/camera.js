import { Group } from './group.js';
import { makeInterpoland } from '../interpolands.js';

export class Camera extends Group {
    constructor(state, group) {
        if (!group) {
            group = state.skid.viewport.root;
        }
        if (!group) {
            throw new Error('initialize viewport before constructing camera');
        }
        super(group);
        this.x = makeInterpoland(state, 0);
        this.y = makeInterpoland(state, 0);
        this.w = makeInterpoland(state, 0);
        this.h = makeInterpoland(state, 0);
        this.anchorX = makeInterpoland(state, 0);
        this.anchorY = makeInterpoland(state, 0);
        this.angle = makeInterpoland(state, 0);
        this.transform = undefined;
    }

    subremove() {
        this.x.remove();
        this.y.remove();
        this.w.remove();
        this.h.remove();
        this.anchorX.remove();
        this.anchorY.remove();
        this.angle.remove();
    }

    draw(context) {
        const canvas = context.canvas;

        context.save();
        context.scale(canvas.width / this.w.curr, canvas.height / this.h.curr);

        const dx = -this.x.curr + this.w.curr * this.anchorX.curr;
        const dy = -this.y.curr + this.h.curr * this.anchorY.curr;
        if (dx || dy) {
            context.translate(dx, dy);
        }

        this.transform = context.getTransform();

        super.draw(context);

        context.restore();
    }
}
