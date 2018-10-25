import {TileFieldSegment} from './tile-field-segment'
import {Group} from './group'

export class TileField {
    constructor(root, tileSize) {
        this.root = root
        this._tileSize = tileSize
        this._rows = Object.create(null)
        this._segments = Object.create(null)
        this.layerOffset = 0
    }

    _keyOf(x, y) {
        return Math.floor(x / 6) + ',' + Math.floor(y)
    }
    _ensureRow(y) {
        let result = this._rows[y]
        if(!result) {
            result = new Group(this.root)
            result.layer = y + this.layerOffset
            this._rows[y] = result
        }
        return result
    }
    nodeAt(x, y) {
        const key = this._keyOf(x, y)
        let result = this._segments[key]
        if(!result) {
            result = new TileFieldSegment(this._ensureRow(y), this._tileSize)
            result.layer = x
            this._segments[key] = result
        }
        return result
    }
    clear() {
        Object.keys(this._rows).forEach(key => this._rows[key].remove())
        this._rows = Object.create(null)
        this._segments = Object.create(null)
    }
}
