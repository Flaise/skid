import { Group } from './group';
import { Translation } from './translation';
import { Scalement } from './scalement';

export class Cache extends Group {
    constructor(container, tileSize, imageSmoothingEnabled) {
        super(container);

        // must set to true when altering any field
        this.altered = false;

        this.imageSmoothingEnabled = imageSmoothingEnabled;

        // affects granularity of saved image data but not final size/position
        this.tileSize = tileSize;

        // Don't directly change these fields from external code:

        this._canvas = document.createElement('canvas');
        this._context = this._canvas.getContext('2d');
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
    }

    get _altered() {
        throw new Error('use cache.altered, not cache._altered');
    }

    set _altered(a) {
        throw new Error('use cache.altered, not cache._altered');
    }

    insert(avatar) {
        super.insert(avatar);
        this.altered = true;
    }

    removeAvatar(avatar) {
        super.removeAvatar(avatar);
        this.altered = true;
    }

    draw(context) {
        if (this.altered) {
            this.altered = false;

            const bounds = this.bounds();
            if (bounds) {
                [this._x, this._y, this._width, this._height] = bounds;
                this._canvas.width = Math.ceil(this._width * this.tileSize);
                this._canvas.height = Math.ceil(this._height * this.tileSize);
            } else {
                this._canvas.width = 0;
                this._canvas.height = 0;
            }

            if (!this._canvas.width || !this._canvas.height) {
                return;
            }

            if (this.imageSmoothingEnabled !== undefined) {
                this._context.imageSmoothingEnabled = this.imageSmoothingEnabled;
                this._context.mozImageSmoothingEnabled = this.imageSmoothingEnabled;
            }

            // Scale and translate so draw operations fit in the canvas
            Scalement.draw(this._context, this.tileSize, this.tileSize, () => {
                Translation.draw(this._context, -this._x, -this._y, () => {
                    // Draw all contents to the saved canvas. The scale/translate operations make it
                    // so that no changes to the contained avatars are necessary.
                    super.draw(this._context);
                });
            });
        } else if (!this._canvas.width || !this._canvas.height) {
            return;
        }

        // Draw the entire saved canvas to the rectangle specified by this.bounds() earlier.
        context.drawImage(this._canvas, 0, 0, this._canvas.width, this._canvas.height,
            this._x, this._y, this._width, this._height);
    }
}
