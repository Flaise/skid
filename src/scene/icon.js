import {loadData, reloadData, startLoading, doneLoading} from '../load';
import {handle} from '../event';

export class Icon {
    constructor(image, layout) {
        this.image = image
        this.layout = layout
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
        if(!data) {
            console.warn('Icon has no bounds data because layout not initialized')
            return [x, y, 0, 0]
        }
        else if(data.solid)
            return [x + data.wFactor * w, y + data.hFactor * h, w * data.sx, h * data.sy]
        else
            return [x + data.wFactor * w, y + data.hFactor * h,
                    (w + data.insetWRel * w) * data.sx,
                    (h + data.insetHRel * h) * data.sy]
    }
}

export function loadImage(state, source, sizeBytes) {
    const image = new window.Image();
    loadData(state, source, sizeBytes, () => Promise.resolve(source))
        .then((data) => {
            image.src = data;
        });
    return image;
}

export function loadIcon(state, source, ax, ay, diameter, sizeBytes) {
    if (typeof source === 'string' || source instanceof window.URL) {
        const icon = new Icon();
        const image = new window.Image();
        icon.image = image;
        loadData(state, source, sizeBytes, (data) => new Promise((resolve, reject) => {
            image.onload = () => {
                icon.layout = computeLayout(ax, ay, diameter, image.width, image.height, 0, 0,
                                            image.width, image.height, true);
                resolve();
            };
            image.onerror = () => {
                // There's an error parameter here but it doesn't contain meaningful details.

                console.error(`Failed to load icon from '${source}'`);
                reject();
            };
            if (data) {
                image.src = data;
            } else {
                // HTTP request failed; may be running on localhost, so try loading without HTTP
                image.src = source;
            }
        }));
        return icon;
    } else {
        return new Icon(source, computeLayout(ax, ay, diameter, source.width, source.height, 0, 0,
                                              source.width, source.height, true));
    }
}

export function reloadIcon(state, icon, source, ax, ay, diameter) {
    let loadId = undefined;
    if (state.skid.load) loadId = startLoading(state, 0);

    reloadData(state, source, () => Promise.resolve(source))
        .then((data) => {
            const image = new window.Image();
            image.onload = () => {
                // TODO: Putting this here reduces flicker but also introduces race condition.
                // TODO: Need a way to mark an image load as canceled.
                icon.image = image;

                icon.layout = computeLayout(ax, ay, diameter, image.width, image.height, 0, 0,
                                            image.width, image.height, true);

                if (loadId) doneLoading(state, loadId);
                handle(state, 'icon_reloaded', icon);
                handle(state, 'request_draw');
            };
            image.src = data;
        });
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

    var axRel
    if(isNaN(ax)) {
        axRel = .5
    } else {
        axRel = ax / untrimmedWidth
    }

    var ayRel
    if(isNaN(ay)) {
        ayRel = .5
    } else {
        ayRel = ay / untrimmedHeight
    }

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
        // TODO: experiment with splitting numerator from denominator instead
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
