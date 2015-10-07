import Vec2 from '../vector2'
import Avatar from './avatar'
import Group from './group'
import Translation from './translation'
import Scalement from './scalement'



    // if(this.field._lastImage !== this.icons.atlas.image) {
    //     // TODO: update when current segment changes, when adjacent segment changes, or when atlas changes
    // }
    

export default class TileFieldSegment extends Avatar {
    constructor(container, tileSize) {
        super(container)
        this._tileSize = tileSize
        this._canvas = document.createElement('canvas')
        this._context = this._canvas.getContext('2d')
        this._field = this
        this._altered = false
        this._minX = 0
        this._minY = 0
        this._maxX = 0
        this._maxY = 0
        this._width = 0
        this._height = 0
        this._excribed = false
        this.root = new Scalement(undefined, tileSize, tileSize)
        this.translation = new Translation(this.root)
        this.group = this.translation
    }
    
    alter() {
        this._altered = true
    }
    
    draw(context) {
        if(this._altered) {
            this._altered = false
            
            this.excribeAll()
            
            if(!this._canvas.width || !this._canvas.height)
                return
            
            this.root.draw(this._context)
        }
        else if(!this._canvas.width || !this._canvas.height)
            return
        
        context.drawImage(this._canvas, 0, 0, this._canvas.width, this._canvas.height,
                          this._minX, this._minY, this._width, this._height)
    }
    
    makeTile(icon, x, y, layer) {
        new SimpleTile(this.group, icon, x, y, layer)
        this.alter()
    }
    
    excribeAll() {
        this._excribed = false
        this.group.walkContents(avatar => this.excribe(...avatar.bounds()))
        
        // TODO: This will never interpolate so this could be done without Interpoland objects
        this.translation.x.setToInitial(-this._minX)
        this.translation.y.setToInitial(-this._minY)
        
        this._width = this._maxX - this._minX
        this._height = this._maxY - this._minY
        
        this._canvas.width = Math.ceil(this._width * this._tileSize)
        this._canvas.height = Math.ceil(this._height * this._tileSize)
    }
    
    excribe(x, y, w, h) {
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


TileFieldSegment.prototype._addAtlas = function(atlas) {
    if(is.defined(this._atlas)) {
        sanity(atlas === this._atlas)
        return
    }
    this._atlas = atlas
    var _this = this
    this._atlas.isLoaded.on_pc(true, function() {
        _this._isLoaded = true
        _this._alter()
    })
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


class SimpleTile extends Avatar {
    constructor(container, icon, x, y, layer) {
        super(container)
        this.icon = icon
        this.x = x
        this.y = y
        this.layer = layer
    }
    
    draw(context) {
        this.icon.draw(context, this.x, this.y, 1, 1)
    }
    
    bounds() {
        return this.icon.bounds(this.x, this.y, 1, 1)
    }
    
    get image() {
        return this.icon && this.icon.atlas && this.icon.atlas.image
    }
}



// TileFieldSegment.prototype.drawTile = function(icon, x, y, layer, type) {
//     new SimpleTile(this.group, icon, x, y, layer)
//     this.alter()
    
    // TODO: do something with type externally
    // TODO: return result for removal
    
    // var _this = this
    //
    // if(sanity(icon))
    //     return function() {}
    // if(sanity(is.defined(layer)))
    //     layer = 0
    //
    // if(type) {
    //     var here = new Vec2(x, y) // make visible to returned removal
    //     this._recordTile(type, here)
    // }
    //
    // var op = {
    //     name: 'drawTile: ' + (icon && icon.data && icon.data.name),
    //     layer: y + layer,
    //     execute: function() {
    //         _this._drawIcon(icon, Math.floor(x * _this._tileSize - _this._minX),
    //                         Math.floor(y * _this._tileSize - _this._minY),
    //                         _this._tileSize, _this._tileSize)
    //     },
    //     excribe: function() {
    //         _this._excribeTileIcon(icon, x, y)
    //     }
    // }
    // this._drawOperations.push(op)
    // this._alter()
    //
    // return function() {
    //     if(type)
    //         _this._derecordTile(type, here)
    //     removeFromArray(_this._drawOperations, op)
    //     _this._alter()
    // }
// }
