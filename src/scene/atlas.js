import Icon from './icon'

export default class Atlas {
    constructor() {
        this._icons = Object.create(null)
        this._layout = undefined
        this._image = undefined
        this._loadingCounter = 0
    }
    
    get(name) {
        let icon = this._icons[name]
        if(!icon) {
            icon = new Icon(this.image, this.layoutOf(name))
            this._icons[name] = icon
        }
        return icon
    }
    
    set image(value) {
        this._image = value
        for(let key of Object.keys(this._icons))
            this._icons[key].image = value
    }
    get image() {
        return this._image
    }
    
    set layout(value) {
        this._layout = value
        for(let key of Object.keys(this._icons))
            this._icons[key].layout = this.layoutOf(key)
    }
    get layout() {
        return this._layout
    }
    
    layoutOf(name) {
        return this.layout && this.layout.sprites && this.layout.sprites[name]
    }
    
    hasData(name) {
        return !!this.layoutOf(name)
    }
    
    loadImage(source, next) {
        this.image = undefined
        if(!source)
            return next && next()
        
        this._loadingCounter += 1
        const loadingCounter = this._loadingCounter
        
        loadImageObject(source, (err, image) => {
            if(loadingCounter !== this._loadingCounter)
                return
            
            if(err) {
                if(next)
                    next(err)
                else
                    console.error(err)
                return
            }
            
            this.image = image
            next && next()
        })
    }
    
    load(data, next) {
        const oldImage = this.layout && this.layout.image
        this.layout = data
        
        if(data.image && data.image !== oldImage)
            this.loadImage(data.image, next)
        else
            setTimeout(next)
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
