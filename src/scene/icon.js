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
                              x - data.axRel * w * data.sx,
                              y - data.ayRel * h * data.sy,
                              w * data.sx, h * data.sy)
        }
        else {
            context.drawImage(image, data.x, data.y, data.w, data.h,
                              x + (data.insetXRel - data.axRel) * w * data.sx,
                              y + (data.insetYRel - data.ayRel) * h * data.sy,
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
            return [x - data.axRel * w * data.sx, y - data.ayRel * h * data.sy,
                    w * data.sx, h * data.sy]
        else
            return [x + (data.insetXRel - data.axRel) * w * data.sx,
                    y + (data.insetYRel - data.ayRel) * h * data.sy,
                    (w + data.insetWRel * w) * data.sx,
                    (h + data.insetHRel * h) * data.sy]
    }
}
