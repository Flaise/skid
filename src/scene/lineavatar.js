import { Avatar } from './avatar';
import { makeInterpoland } from '../interpolands';

export class LineAvatar extends Avatar {
    constructor(state, group) {
        super(group);
        this.strokeStyle = undefined;
        this.lineWidth = undefined;
        this.x1 = makeInterpoland(state, 0);
        this.y1 = makeInterpoland(state, 0);
        this.x2 = makeInterpoland(state, 0);
        this.y2 = makeInterpoland(state, 0);
    }

    draw(context) {
        context.save();

        context.strokeStyle = this.strokeStyle;
        context.lineWidth = this.lineWidth;
        context.beginPath();
        context.moveTo(this.x1.curr, this.y1.curr);
        context.lineTo(this.x2.curr, this.y2.curr);
        context.stroke();

        context.restore();
    }

    subremove() {
        this.x1.remove();
        this.y1.remove();
        this.x2.remove();
        this.y2.remove();
    }
}
