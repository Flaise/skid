import {default as Icon} from './icon'


export default class Atlas {
    constructor() {
        this.icons = Object.create(null)
        this.layout = undefined
    }
    
    get(name) {
        let icon = this.icons[name]
        if(!icon) {
            const sprite = (this.layout && this.layout.sprites &&
                            this.layout.sprites[name])
            icon = new Icon(this, sprite)
            this.icons[name] = icon
        }
        return icon
    }
    
    hasData(name) {
        return !!(this.layout && this.layout[name])
    }
    
    loadImage(source, next) {
        loadImageObject(source, (err, image) => {
            if(err)
                return next && next(err)
            
            this.image = image
            next()
        })
    }
    
    load(data, next) {
        const oldImage = this.layout && this.layout.image
        
        for(let spriteName of Object.keys(data.sprites)) {
            const icon = this.icons[spriteName]
            if(icon)
                icon.load(data.sprites[spriteName])
        }
        this.layout = data
        
        if(data.image && data.image !== oldImage) {
            this.image = undefined
            this.loadImage(data.image, next)
        }
        else {
            setTimeout(next)
        }
    }
}

function loadImageObject(source, next) {
    const image = new window.Image()
    image.onload = () => {
        image.onload = image.onerror = image.onabort = undefined
        next && next(undefined, image)
    }
    image.onerror = () => {
        image.onload = image.onerror = image.onabort = undefined
        next && next(new Error('Unable to load image.'))
    }
    image.src = source
}
