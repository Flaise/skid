export default class Icon {
    constructor(atlas, name) {
        this.atlas = atlas
        this.name = name
        this._hFlip = undefined
        this._vFlip = undefined
        this.flipX = 1
        this.flipY = 1
    }
    
    // TODO: flippedX().flippedY().flippedX().flippedY() does not return original
    flippedX() {
        if(!this._hFlip) {
            this._hFlip = new Icon(this.atlas)
            this._hFlip.flipX = -this.flipX
            this._hFlip._hFlip = this
        }
        return this._hFlip
    }
    
    /* The DOM image backing this icon that gets read by the HTML5 canvas API. */
    get image() {
        return this.atlas && this.atlas.image
    }
    
    _data() {
        return this.atlas && this.atlas.layout && this.atlas.layout.sprites
               && this.atlas.layout.sprites[this.name]
    }
    
    draw(context, x, y, w, h) {
        const data = this._data()
        
        if(!data)
            return
        if(!this.atlas.image)
            return
        if(w === 0 || h === 0)
            return
        if(!w || !h)
            return console.warn('Invalid destination size ' + w + ', ' + h)
        if(!this.atlas.image.width || !this.atlas.image.height)
            return // if missing, Firefox throws and Chrome (sometimes?) has performance issues
        
        if(data.solid) {
            if((this.flipX !== 1) || (this.flipY !== 1)) {
                ////////////////////////////////////// TODO: precompute flipped atlas
                context.save()
                context.scale(this.flipX, this.flipY)
            }
            context.drawImage(this.atlas.image, data.x, data.y, data.w, data.h,
                              this.flipX * x - data.axRel * w * data.sx,
                              this.flipY * y - data.ayRel * h * data.sy,
                              w * data.sx, h * data.sy)
            if((this.flipX !== 1) || (this.flipY !== 1)) {
                context.restore()
            }
        }
        else {
            if((this.flipX !== 1) || (this.flipY !== 1)) {
                context.save()
                context.scale(this.flipX, this.flipY)
            }
            context.drawImage(this.atlas.image, data.x, data.y, data.w, data.h,
                              this.flipX * x + (data.insetXRel - data.axRel) * w * data.sx,
                              this.flipY * y + (data.insetYRel - data.ayRel) * h * data.sy,
                              (w + data.insetWRel * w) * data.sx,
                              (h + data.insetHRel * h) * data.sy)
            if((this.flipX !== 1) || (this.flipY !== 1)) {
                context.restore()
            }
        }
    }
    
    /*
     * Returns an [x, y, w, h] array of rectangle bounds that specify the area of the canvas that
     * will be taken up when this icon is drawn on a tile of the dimensions given.
     */
    bounds(x, y, w, h) {
        const data = this._data()
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

export const blank = new Icon()
