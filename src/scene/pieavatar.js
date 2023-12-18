import { Avatar } from './avatar.js';
import { toRadians } from '../turns.js';
import { makeInterpoland } from '../interpolands.js';

export class PieAvatar extends Avatar {
    constructor(state, container) {
        super(container);
        this.x = makeInterpoland(state, 0);
        this.y = makeInterpoland(state, 0);
        this.w = makeInterpoland(state, 0);
        this.h = makeInterpoland(state, 0);
        // Distance of second jaw from first jaw. Positive is clockwise.
        // 0 = nothing rendered. 1 = full circle.
        this.breadth = makeInterpoland(state, 0);
        // Distance of first jaw from north. Positive is clockwise.
        this.startAngle = makeInterpoland(state, 0);
        this.innerRadiusRel = makeInterpoland(state, 0);
        this.fillStyle = undefined;
        this.strokeStyle = undefined;
        this.lineWidth = undefined;
    }

    draw(context) {
        if (this.breadth.curr === 0) {
            return;
        }

        context.save();
        if (this.x.curr || this.y.curr) {
            context.translate(this.x.curr, this.y.curr);
        }
        if (this.w.curr !== 1 || this.h.curr !== 1) {
            context.scale(this.w.curr, this.h.curr);
        }

        context.beginPath();

        if (this.breadth.curr >= 1 && this.innerRadiusRel.curr >= 1) {
            context.arc(0, 0, 0.5, 0, Math.PI * 2, false);
        } else {
            let startAngle = this.startAngle.curr;
            let endAngle = startAngle + this.breadth.curr;

            startAngle = toRadians(startAngle - 0.25);
            endAngle = toRadians(endAngle - 0.25);

            context.arc(0, 0, 0.5 * this.innerRadiusRel.curr, endAngle, startAngle,
                this.breadth.curr >= 0);
            context.arc(0, 0, 0.5, startAngle, endAngle, this.breadth.curr < 0);
        }

        context.closePath();

        if (this.fillStyle) {
            context.fillStyle = this.fillStyle;
            context.fill();
        }
        if (this.strokeStyle && this.lineWidth) {
            context.strokeStyle = this.strokeStyle;
            context.lineWidth = this.lineWidth;
            context.stroke();
        }

        context.restore();
    }

    subremove() {
        this.x.remove();
        this.y.remove();
        this.w.remove();
        this.h.remove();
        this.breadth.remove();
        this.startAngle.remove();
        this.innerRadiusRel.remove();
    }
}
