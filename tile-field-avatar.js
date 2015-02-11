'use strict'

var Vect2 = require('./vect2')
var esquire = require('../esquire')
var is = require('./is')
var sanity = require('./sanity')
var Avatar = require('./avatar')


function TileFieldAvatar(avatars, tileSize) {
    Avatar.call(this, avatars)

    this._canv = document.createElement('canvas')
    this._canv.width = 0
    this._canv.height = 0
    this._context = this._canv.getContext('2d')
    this._context.webkitImageSmoothingEnabled = true
    this._context.mozImageSmoothingEnabled = true
    
    sanity.attribute(this, 'fieldGroup', this, is.object)
    this._drawOperations = []
    this._altered = false
    this._minX = undefined
    this._minY = undefined
    this._maxX = undefined
    this._maxY = undefined
    this._atlas = undefined
    this._isLoaded = false
    
    // maps types to sets of positions
    this._type2tiles = {}
    
    sanity.attributes(this, {
        _x: 0,
        _y: 0,
        _w: 0,
        _h: 0
    }, is.number)
    
    this.tileSize = tileSize // assign to property for type checking
}
TileFieldAvatar.prototype = Object.create(Avatar.prototype)
module.exports = exports = TileFieldAvatar

Object.defineProperty(TileFieldAvatar.prototype, 'tileSize', {
    get: function() { return this._tileSize },
    set: function(value) {
        if(sanity(is.number(value)))
            return
        sanity(is.integer(value))
        this._tileSize = value
        this._minX = undefined
        this._excribeAll()
        this._alter()
    }
})

TileFieldAvatar.prototype._alter = function() {
    this._altered = true
}

TileFieldAvatar.prototype.draw = function(context) {
    if(this._altered) {
        this._altered = false
        
        // shape of selected tile changes when adjacent tile field is altered
        this._excribeAll()
        
        this._canv.width = this._maxX - this._minX
        this._canv.height = this._maxY - this._minY
        if(!this._canv.width || !this._canv.height)
            return
        
        this._drawOperations.sort(function(a, b) { return a.layer - b.layer })
        this._drawOperations.forEach(function(op) { op.execute() })
        
        sanity(!this._drawOperations.length || this._atlas)
    }
    else if(!this._canv.width || !this._canv.height)
        return
    
    context.drawImage(this._canv, 0, 0, this._canv.width, this._canv.height,
                      this._x, this._y, this._w, this._h)
}

TileFieldAvatar.prototype._recordTile = function(type, position) {
    if(!this._type2tiles[type])
        this._type2tiles[type] = {}
    this._type2tiles[type][position] = true
}
TileFieldAvatar.prototype._derecordTile = function(type, position) {
    if(this._type2tiles[type])
        delete this._type2tiles[type][position]
}
TileFieldAvatar.prototype.hasTile = function(position, type) {
    return this._type2tiles[type] && this._type2tiles[type][position]
}

TileFieldAvatar.prototype._excribe = function(x, y, w, h) {
    if(isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h))
        return
    
    x = Math.floor(x)
    y = Math.floor(y)
    w = Math.ceil(w)
    h = Math.ceil(h)
    
    if(this._minX === undefined) {
        this._minX = x
        this._minY = y
        this._maxX = x + w
        this._maxY = y + h
    }
    else {
        this._minX = Math.min(this._minX, x)
        this._minY = Math.min(this._minY, y)
        this._maxX = Math.max(this._maxX, x + w)
        this._maxY = Math.max(this._maxY, y + h)
    }
    
    this._x = this._minX / this._tileSize
    this._y = this._minY / this._tileSize
    this._w = (this._maxX - this._minX) / this._tileSize
    this._h = (this._maxY - this._minY) / this._tileSize
}

TileFieldAvatar.prototype._excribeIcon = function(icon, x, y, w, h) {
    if(icon.atlas)
        this._excribe.apply(this, icon.bounds(x, y, w, h))
}
TileFieldAvatar.prototype._excribeTileIcon = function(icon, x, y) {
    this._excribeIcon(icon, x * this._tileSize, y * this._tileSize, this._tileSize, this._tileSize)
}
TileFieldAvatar.prototype._excribeAll = function() {
    this._drawOperations.forEach(function(op) {
        op.excribe()
    })
}

TileFieldAvatar.prototype._addAtlas = function(atlas) {
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

TileFieldAvatar.prototype._drawIcon = function(icon, x, y, w, h) {
    if(sanity.throws) {
        if(sanity(is.number(x))
                || sanity(is.number(y))
                || sanity(is.number(w))
                || sanity(is.number(h)))
            return
    }
    if(!icon || !icon.atlas)
        return
    this._addAtlas(icon.atlas)
    if(this._isLoaded)
        icon.draw(this._context, x, y, w, h)
}


var xs = [-.25, .25, -.25, .25]
var ys = [-.25, -.25, .25, .25]

TileFieldAvatar.prototype.drawSelectedTile = function(selector, type, x, y, layer, observedTypes) {
    var _this = this
    
    if(sanity(is.defined(layer)))
        layer = 0
    if(!observedTypes)
        observedTypes = [type]

    var here = new Vect2(x, y)
    this._recordTile(type, here)

    function hasTilei(dx, dy) {
        var dest = here.sumi(dx, dy)
        return observedTypes.some(function(t) { return _this.fieldGroup.hasTile(dest, t) })
    }
    
    function select() {
        return selector(hasTilei(-1, -1), hasTilei(0, -1), hasTilei(1, -1),
                        hasTilei(-1, 0), hasTilei(1, 0),
                        hasTilei(-1, 1), hasTilei(0, 1), hasTilei(1, 1))
    }
    
    var op = {
        name: 'drawSelectedTile: ' + type,
        layer: y + layer,
        execute: function() {
            select().forEach(function(icon, index) {
                if(!icon)
                    return
                _this._drawIcon(icon, Math.floor((x + xs[index]) * _this._tileSize - _this._minX),
                                Math.floor((y + ys[index]) * _this._tileSize - _this._minY),
                                _this._tileSize / 2, _this._tileSize / 2)
            })
        },
        excribe: function() {
            select().forEach(function(icon, index) {
                if(!icon)
                    return
                _this._excribeIcon(icon, (x + xs[index]) * _this._tileSize,
                                   (y + ys[index]) * _this._tileSize,
                                   _this._tileSize / 2, _this._tileSize / 2)
            })
        }
    }
    this._drawOperations.push(op)
    this._alter()
    
    return function() {
        _this._derecordTile(type, here)
        removeFromArray(_this._drawOperations, op)
        _this._alter()
    }
}

TileFieldAvatar.prototype.drawTile = function(icon, x, y, layer, type) {
    var _this = this
    
    if(sanity(icon))
        return function() {}
    if(sanity(is.defined(layer)))
        layer = 0
    
    if(type) {
        var here = new Vect2(x, y) // make visible to returned removal
        this._recordTile(type, here)
    }
    
    var op = {
        name: 'drawTile: ' + (icon && icon.data && icon.data.name),
        layer: y + layer,
        execute: function() {
            _this._drawIcon(icon, Math.floor(x * _this._tileSize - _this._minX),
                            Math.floor(y * _this._tileSize - _this._minY),
                            _this._tileSize, _this._tileSize)
        },
        excribe: function() {
            _this._excribeTileIcon(icon, x, y)
        }
    }
    this._drawOperations.push(op)
    this._alter()
    
    return function() {
        if(type)
            _this._derecordTile(type, here)
        removeFromArray(_this._drawOperations, op)
        _this._alter()
    }
}


function removeFromArray(array, element) {
    var index = array.indexOf(element)
    if(index >= 0)
        array.splice(index, 1)
    return index
}
