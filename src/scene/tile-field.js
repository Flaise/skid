import TileFieldSegment from './tile-field-segment'
import Group from './group'

export default class TileField {
    constructor(root, tileSize) {
        this.root = root
        // limit pixel size to limit redraws - maximum is roughly 8000 on Firefox
        // subtract a few for objects that aren't contained by their tiles
        this._tilesPerSegment = Math.floor(7000 / tileSize) - 2
        this._tileSize = tileSize
        this._rows = Object.create(null)
        this._segments = Object.create(null)
    }
    
    _keyOf(x, y) {
        return Math.floor(x / this._tilesPerSegment) + ',' + Math.floor(y)
    }
    _ensureRow(y) {
        let result = this._rows[y]
        if(!result) {
            result = new Group(this.root)
            result.layer = y
            this._rows[y] = result
        }
        return result
    }
    _ensureSegment(x, y) {
        const key = this._keyOf(x, y)
        let result = this._segments[key]
        if(!result) {
            result = new TileFieldSegment(this._ensureRow(y), this._tileSize)
            result._field = this
            result.layer = x
            this._segments[key] = result
        }
        return result
    }
    _modifyAt(x, y) {
        const segment = this._segments[this._keyOf(x, y)]
        if(segment)
            segment.alter()
    }
    _modifyAround(x, y) {
        this._modifyAt(x - 1, y - 1)
        this._modifyAt(x + 1, y - 1)
        this._modifyAt(x - 1, y)
        this._modifyAt(x + 1, y)
        this._modifyAt(x - 1, y + 1)
        this._modifyAt(x + 1, y + 1)
    }
    
    // hasTile(position, type) {
    //     const segment = this._segments[this._keyOf(position.x, position.y)]
    //     if(!segment)
    //         return false
    //     return segment.hasTile(position, type)
    // }
    drawSelectedTile(selector, type, x, y, layer, observedTypes) {
        // const removal = this._ensureSegment(x, y).drawSelectedTile(selector, type, x, y, layer,
        //                                                            observedTypes)
        // this._modifyAround(x, y)
        // return () => {
        //     removal()
        //     this._modifyAround(x, y)
        // }
    }
    makeTile(icon, x, y, layer) {
        this._ensureSegment(x, y).makeTile(icon, x, y, layer)
        this._modifyAround(x, y)
    }
    remove() {
        Object.keys(this._rows).forEach(key => this._rows[key].remove())
    }
}
