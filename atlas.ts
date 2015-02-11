'use strict'

declare function require(name:string)
var Icon = require('./icon')
var Reactant = require('esquire/reactant')

class Atlas {
    image
    isLoaded
    
    constructor(private layout) {
        Object.defineProperty(this, 'isLoaded', {value: new Reactant(false)})
        this.setSource(undefined, layout.image, undefined)
    }
    
    makeIcon(name:string) {
        if(!name)
            return new Icon()
        
        var sprite = this.layout.sprites[name]
        
        if(!sprite) {
            console.warn('Icon "' + name + '" not found.')
            return new Icon()
        }
        
        if(!sprite.icon)
            sprite.icon = new Icon(this, sprite)
        return sprite.icon
    }
    
    iconExists(name:string) {
        return !!this.layout.sprites[name]
    }
    
    setSource(_layout, _imageSource, next) {
        if(!next)
            next = (err) => {
                if(err)
                    console.error(err.stack || err)
            }
        
        this.isLoaded.value = false
        
        loadImage(_imageSource, (err, image) => {
            if(err)
                return next(err)
            
            try {
                if(_layout) {
                    Object.keys(_layout.sprites).forEach(spriteName => {
                        var newSprite = _layout.sprites[spriteName]
                        var oldSprite = this.layout.sprites[spriteName]
                        if(!oldSprite) {
                            console.warn('New sprite "' + spriteName + '" has no old sprite.')
                            return 
                        }
                        var icon = oldSprite.icon
                        if(icon) {
                            newSprite.icon = icon
                            icon.data = newSprite
                            if(icon._hFlip)
                                icon._hFlip.data = newSprite
                            if(icon._vFlip)
                                icon._vFlip.data = newSprite
                        }
                    })
                    this.layout = _layout
                }
                
                this.image = image
                
                this.isLoaded.value = true
                next(null)
            }
            catch(err) {
                next(err)
            }
        })
    }
}
export = Atlas

function loadImage(source, next) {
    if(!next)
        throw new Error() // makes no sense to non-explicitly discard resulting image
    var image = new Image()
    image.onload = () => {
        image.onload = image.onerror = image.onabort = undefined
        
        if(next)
            next(null, image)
    }
    image.onerror = () => {
        image.onload = image.onerror = image.onabort = undefined
        
        if(next)
            next('Unable to load image.')
    }
    image.src = source
}
