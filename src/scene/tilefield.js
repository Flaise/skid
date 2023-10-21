import { Cache } from './cache';
import { Group } from './group';

const TILES_PER_SEGMENT = 6;

export class TileField {
    constructor(root, tileSize, imageSmoothingEnabled) {
        this.root = root;
        this._tileSize = tileSize;
        this._rows = Object.create(null);
        this._segments = Object.create(null);
        this.layerOffset = 0;

        // In the current imlementation, altering this field after a row has been created will have
        // no effect on that row.
        this.imageSmoothingEnabled = imageSmoothingEnabled;
    }

    _keyOf(x, y) {
        return Math.floor(x / TILES_PER_SEGMENT) + ',' + Math.floor(y);
    }

    _ensureRow(y) {
        let result = this._rows[y];
        if (!result) {
            result = new Group(this.root);
            result.layer = y + this.layerOffset;
            this._rows[y] = result;
        }
        return result;
    }

    nodeAt(x, y) {
        const key = this._keyOf(x, y);
        let result = this._segments[key];
        if (!result) {
            result = new Cache(this._ensureRow(y), this._tileSize, this.imageSmoothingEnabled);

            // This will be different depending on what order in which the avatars are added to the
            // segment but the sorting order compared to other segments on the row will be the same
            // regardless because their ranges don't overlap.
            result.layer = x;

            this._segments[key] = result;
        }
        return result;
    }

    clear() {
        Object.keys(this._rows).forEach((key) => this._rows[key].remove());
        this._rows = Object.create(null);
        this._segments = Object.create(null);
    }
}
