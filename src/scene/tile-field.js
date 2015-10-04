import TileFieldSegment from './tile-field-segment'
import Smoothing from './smoothing'

export default class TileField {
    constructor(root, tileSize, maxTileSize) {
        this.root = root
        // limit pixel size to limit redraws - maximum is roughly 8000 on Firefox
        // subtract a few for objects that aren't contained by their tiles
        this.tilesPerSegment = Math.floor(5000 / maxTileSize) - 2
        this._tileSize = tileSize
        this._rows = Object.create(null)
        this._fields = Object.create(null)
        this._smoothingEnabled = undefined
        this._layer = 0
    }
    
    _indexOf(x, y) {
        return Math.floor(x / this.tilesPerSegment) + ',' + Math.floor(y)
    }
    _ensureRow(y) {
        let result = this._rows[y]
        if(!result) {
            result = new Smoothing(this.root)
            result.enabled = this.smoothingEnabled
            result.layer = y
            this._rows[y] = result
        }
        return result
    }
    _ensureField(x, y) {
        const fieldIndex = this._indexOf(x, y)
        let result = this._fields[fieldIndex]
        if(!result) {
            result = new TileFieldSegment(this._ensureRow(y), this.tileSize)
            result.fieldGroup = this
            result.layer = x
            this._fields[fieldIndex] = result
        }
        return result
    }
    _modifyAt(x, y) {
        const field = this._fields[this._indexOf(x, y)]
        if(field)
            field._alter()
    }
    _modifyAround(x, y) {
        this._modifyAt(x - 1, y - 1)
        this._modifyAt(x + 1, y - 1)
        this._modifyAt(x - 1, y)
        this._modifyAt(x + 1, y)
        this._modifyAt(x - 1, y + 1)
        this._modifyAt(x + 1, y + 1)
    }
    
    hasTile(position, type) {
        const field = this._fields[this._indexOf(position.x, position.y)]
        if(!field)
            return false
        return field.hasTile(position, type)
    }
    drawSelectedTile(selector, type, x, y, layer, observedTypes) {
        const removal = this._ensureField(x, y).drawSelectedTile(selector, type, x, y, layer,
                                                                 observedTypes)
        this._modifyAround(x, y)
        return () => {
            removal()
            this._modifyAround(x, y)
        }
    }
    drawTile(icon, x, y, layer, type) {
        const removal = this._ensureField(x, y).drawTile(icon, x, y, layer, type)
        this._modifyAround(x, y)
        return () => {
            removal()
            this._modifyAround(x, y)
        }
    }
    remove() {
        Object.keys(this._rows).forEach(key => this._rows[key].remove())
    }
    
    _forEach(callback) {
        Object.keys(this._fields).forEach(key => callback(this._fields[key]))
    }
    
    get tileSize() {
        return this._tileSize
    }
    set tileSize(value) {
        this._tileSize = value
        this._forEach(field => { field.tileSize = value })
    }
    
    get smoothingEnabled() {
        return this._smoothingEnabled
    }
    set smoothingEnabled(value) {
        this._smoothingEnabled = value
        Object.keys(this._rows).forEach(key => { this._rows[key].enabled = value })
    }
}
