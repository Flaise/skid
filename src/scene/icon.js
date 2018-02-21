import {loadData} from '../load';

export class Icon {
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
        for(const avatar of this._avatars)
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

export function loadIcon(state, source, ax, ay, diameter, sizeBytes) {
    if (typeof source === 'string') {
        const icon = new Icon();
        const image = new window.Image();
        icon.image = image;
        image.onload = () => {
            icon.layout = computeLayout(ax, ay, diameter, image.width, image.height, 0, 0,
                                        image.width, image.height, true);
        };
        loadData(state, source, sizeBytes).then((source) => {
            image.src = source;
        });
        return icon;
    } else {
        return new Icon(source, computeLayout(ax, ay, diameter, source.width, source.height, 0, 0,
                                              source.width, source.height, true));
    }
}

function computeLayout(ax, ay, diameter, untrimmedWidth, untrimmedHeight,
                       sourceX, sourceY, sourceW, sourceH,
                       solid,
                       localX, localY, localW, localH) {
    var layout = {}
    layout.x = sourceX
    layout.y = sourceY
    layout.w = sourceW
    layout.h = sourceH

    if(isNaN(ax))
        ax = untrimmedWidth / 2
    var axRel = ax / untrimmedWidth

    if(isNaN(ay))
        ay = untrimmedHeight / 2
    var ayRel = ay / untrimmedHeight

    if(isNaN(diameter)) {
        // fill square tile if no diameter is specified
        if(untrimmedHeight > untrimmedWidth) {
            layout.sx = 1
            layout.sy = untrimmedHeight / untrimmedWidth
        }
        else {
            layout.sy = 1
            layout.sx = untrimmedWidth / untrimmedHeight
        }
    }
    else {
        layout.sx = untrimmedWidth / diameter
        layout.sy = untrimmedHeight / diameter
    }

    if(solid) {
        layout.solid = true
        layout.wFactor = layout.sx * -axRel
        layout.hFactor = layout.sy * -ayRel
    }
    else {
        // Corrects for seams in tile fields caused by precision loss
        // TODO: experiment with splitting numerator from denomonator instead
        if(localX % 2 !== 0) {
            localX -= 1
            localW += 1
        }
        if(localY % 2 !== 0) {
            localY -= 1
            localH += 1
        }

        layout.insetWRel = (localW - untrimmedWidth) / untrimmedWidth
        layout.insetHRel = (localH - untrimmedHeight) / untrimmedHeight

        var insetXRel = localX / untrimmedWidth
        var insetYRel = localY / untrimmedHeight

        layout.wFactor = layout.sx * (insetXRel - axRel)
        layout.hFactor = layout.sy * (insetYRel - ayRel)
    }

    return layout
}
