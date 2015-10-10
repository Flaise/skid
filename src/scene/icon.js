import loadImage from './load-image'
import {compute} from '../../texture-packer-exporters/skid/grantlee/0.2/skid.qs'

export default class Icon {
    constructor(image, layout) {
        this._image = image
        this._layout = layout
        this._avatars = []
    }
    
    addAvatar(avatar) {
        this._avatars.push(avatar)
    }
    removeAvatar(avatar) {
        const index = this._avatars.indexOf(avatar)
        if(index >= 0)
            this._avatars.splice(index, 1)
    }
    changed() {
        for(let avatar of this._avatars)
            avatar.changed()
    }
    
    get layout() {
        return this._layout
    }
    set layout(value) {
        this._layout = value
        this.changed()
    }
    
    get image() {
        return this._image
    }
    set image(value) {
        this._image = value
        this.changed()
    }
    
    loadImage(source, fileName, next) {
        if(!source) {
            this.image = undefined
            return next && next()
        }
        
        this.image = loadImage(source, (err, image) => {
            if(this.image !== image)
                return
            
            const trimmedName = fileName.split('.')[0]
            this.layout = compute(trimmedName, image.width, image.height,
                                  0, 0, image.width, image.height, true)
                
            if(next)
                next(err)
            else if(err)
                console.error(err)
        })
    }
    
    draw(context, x, y, w, h) {
        if(w === 0 || h === 0)
            return
        if(!w || !h)
            return console.warn('Invalid destination size ' + w + ', ' + h)
        
        const data = this.layout
        if(!data)
            return
        
        const image = this.image
        if(!image)
            return
        if(!image.width || !image.height)
            return // if missing, Firefox throws and Chrome (sometimes?) has performance issues
        
        if(data.solid) {
            context.drawImage(image, data.x, data.y, data.w, data.h,
                              x + data.wFactor * w,
                              y + data.hFactor * h,
                              w * data.sx, h * data.sy)
        }
        else {
            context.drawImage(image, data.x, data.y, data.w, data.h,
                              x + data.wFactor * w,
                              y + data.hFactor * h,
                              (w + data.insetWRel * w) * data.sx,
                              (h + data.insetHRel * h) * data.sy)
        }
    }
    
    /*
     * Returns an [x, y, w, h] array of rectangle bounds that specify the area of the canvas that
     * will be taken up when this icon is drawn on a tile of the dimensions given.
     */
    bounds(x, y, w, h) {
        const data = this.layout
        if(!data)
            return [x, y, 0, 0]
        else if(data.solid)
            return [x + data.wFactor * w, y + data.hFactor * h, w * data.sx, h * data.sy]
        else
            return [x + data.wFactor * w, y + data.hFactor * h,
                    (w + data.insetWRel * w) * data.sx,
                    (h + data.insetHRel * h) * data.sy]
    }
}
