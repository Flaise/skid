import { Avatar } from './avatar.js';

/*
 * Clears the entire canvas. It is advisable to use this when the entire canvas is not being drawn
 * on every frame. Omitting a ClearAll operation can, however, mitigate rendering artifacts caused
 * by tiling alpha-blended images on some rendering engines, such as Firefox.
 */
export class ClearAll extends Avatar {
    draw(context) {
        const canvas = context.canvas;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}
