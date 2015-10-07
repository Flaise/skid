import Group from './group'
import Translation from './translation'
import Scalement from './scalement'
import IconAvatar from './icon-avatar'

export default class TileFieldSegment extends Group {
    constructor(container, tileSize) {
        super(container)
        this._tileSize = tileSize
        this._canvas = document.createElement('canvas')
        this._context = this._canvas.getContext('2d')
        this._altered = false
        this._minX = 0
        this._minY = 0
        this._maxX = 0
        this._maxY = 0
        this._width = 0
        this._height = 0
        this._excribed = false
    }
    
    changed() {
        this._altered = true
        super.changed()
    }
    
    draw(context) {
        if(this._altered) {
            this._altered = false
            
            this._excribeAll()
            
            if(!this._canvas.width || !this._canvas.height)
                return
            
            Scalement.draw(this._context, this._tileSize, this._tileSize, () => {
                Translation.draw(this._context, -this._minX, -this._minY, () => {
                    super.draw(this._context)
                })
            })
        }
        else if(!this._canvas.width || !this._canvas.height)
            return
        
        context.drawImage(this._canvas, 0, 0, this._canvas.width, this._canvas.height,
                          this._minX, this._minY, this._width, this._height)
    }
    
    makeTile(icon, x, y, layer) {
        const avatar = new IconAvatar(this, icon, x, y, 1, 1)
        avatar.layer = layer
    }
    
    _excribeAll() {
        this._excribed = false
        this.walkContents(avatar => this._excribe(...avatar.bounds()))
        
        this._width = this._maxX - this._minX
        this._height = this._maxY - this._minY
        
        this._canvas.width = Math.ceil(this._width * this._tileSize)
        this._canvas.height = Math.ceil(this._height * this._tileSize)
    }
    
    _excribe(x, y, w, h) {
        if(this._excribed) {
            this._minX = Math.min(this._minX, x)
            this._minY = Math.min(this._minY, y)
            this._maxX = Math.max(this._maxX, x + w)
            this._maxY = Math.max(this._maxY, y + h)
        }
        else {
            this._excribed = true
            this._minX = x
            this._minY = y
            this._maxX = x + w
            this._maxY = y + h
        }
    }
}

var xs = [-.25, .25, -.25, .25]
var ys = [-.25, -.25, .25, .25]

TileFieldSegment.prototype.drawSelectedTile = function(selector, type, x, y, layer, observedTypes) {
    // TODO
    
    // var _this = this
    //
    // if(sanity(is.defined(layer)))
    //     layer = 0
    // if(!observedTypes)
    //     observedTypes = [type]
    //
    // var here = new Vec2(x, y)
    // this._recordTile(type, here)
    //
    // function hasTileXY(dx, dy) {
    //     var dest = here.sumXY(dx, dy)
    //     return observedTypes.some(function(t) { return _this.fieldGroup.hasTile(dest, t) })
    // }
    //
    // function select() {
    //     return selector(hasTileXY(-1, -1), hasTileXY(0, -1), hasTileXY(1, -1),
    //                     hasTileXY(-1, 0), hasTileXY(1, 0),
    //                     hasTileXY(-1, 1), hasTileXY(0, 1), hasTileXY(1, 1))
    // }
    //
    // var op = {
    //     name: 'drawSelectedTile: ' + type,
    //     layer: y + layer,
    //     execute: function() {
    //         select().forEach(function(icon, index) {
    //             if(!icon)
    //                 return
    //             _this._drawIcon(icon, Math.floor((x + xs[index]) * _this._tileSize - _this._minX),
    //                             Math.floor((y + ys[index]) * _this._tileSize - _this._minY),
    //                             _this._tileSize / 2, _this._tileSize / 2)
    //         })
    //     },
    //     excribe: function() {
    //         select().forEach(function(icon, index) {
    //             if(!icon)
    //                 return
    //             _this._excribeIcon(icon, (x + xs[index]) * _this._tileSize,
    //                                (y + ys[index]) * _this._tileSize,
    //                                _this._tileSize / 2, _this._tileSize / 2)
    //         })
    //     }
    // }
    // this._drawOperations.push(op)
    // this._alter()
    //
    // return function() {
    //     _this._derecordTile(type, here)
    //     removeFromArray(_this._drawOperations, op)
    //     _this._alter()
    // }
}
