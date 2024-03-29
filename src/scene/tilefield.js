import { Cache } from './cache.js';
import { Group } from './group.js';

export class TileField {
    constructor(root, tileSize, imageSmoothingEnabled, nodeTileWidth = 8, nodeTileHeight = 1) {
        if (!nodeTileWidth || !nodeTileHeight) {
            throw new Error('tile field requires nodeTileWidth and nodeTileHeight');
        }
        this.root = root;
        this._tileSize = tileSize;
        this._rows = Object.create(null);
        this._segments = Object.create(null);
        this._nodeTileWidth = nodeTileWidth;
        this._nodeTileHeight = nodeTileHeight;
        this.layerOffset = 0;

        // In the current imlementation, altering this field after a row has been created will have
        // no effect on that row.
        this.imageSmoothingEnabled = imageSmoothingEnabled;
    }

    get layer() {
        throw new Error('a tile field has no layer - use field.layerOffset instead');
    }

    set layer(a) {
        throw new Error('a tile field has no layer - use field.layerOffset instead');
    }

    _keyOf(x, y) {
        return Math.floor(x / this._nodeTileWidth) + ',' + Math.floor(y / this._nodeTileHeight);
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
