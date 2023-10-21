import { Avatar } from './avatar';

export class FillAvatar extends Avatar {
    constructor(container, fillStyle, imageSmoothingEnabled) {
        super(container);
        this.fillStyle = fillStyle;

        // Affects smoothing for the entire rendering context.
        // Here because filling and the smoothing setting both often happen at the beginning of
        // rendering.
        this.imageSmoothingEnabled = imageSmoothingEnabled;
    }

    draw(context) {
        if (this.imageSmoothingEnabled !== undefined) {
            context.imageSmoothingEnabled = this.imageSmoothingEnabled;
            context.mozImageSmoothingEnabled = this.imageSmoothingEnabled;
        }

        if (this.fillStyle) {
            const canvas = context.canvas;
            context.fillStyle = this.fillStyle;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
}
