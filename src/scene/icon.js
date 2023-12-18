import { loadData, reloadData, startLoading, doneLoading, finalizeLoadingPromise } from '../load.js';
import { handle } from '../event.js';
import { isString } from '../is.js';

export class Icon {
    constructor(image, layout) {
        this.image = image;
        this.layout = layout;
    }

    draw(context, x, y, w, h) {
        if (w === 0 || h === 0) {
            return;
        }
        if (!w || !h) {
            return console.warn('Invalid destination size ' + w + ', ' + h);
        }

        const data = this.layout;
        if (!data) {
            return;
        }

        const image = this.image;
        if (!image) {
            return;
        }
        if (!image.width || !image.height) {
            // if missing, Firefox throws and Chrome (sometimes?) has performance issues
            return;
        }

        if (data.solid) {
            context.drawImage(image, data.x, data.y, data.w, data.h,
                x + data.wFactor * w,
                y + data.hFactor * h,
                w * data.sx, h * data.sy);
        } else {
            context.drawImage(image, data.x, data.y, data.w, data.h,
                x + data.wFactor * w,
                y + data.hFactor * h,
                (w + data.insetWRel * w) * data.sx,
                (h + data.insetHRel * h) * data.sy);
        }
    }

    /*
     * Returns an [x, y, w, h] array of rectangle bounds that specify the area of the canvas that
     * will be taken up when this icon is drawn on a tile of the dimensions given.
     */
    bounds(x, y, w, h) {
        const data = this.layout;
        if (!data) {
            console.warn('Icon has no bounds data because layout is not initialized.');
            return [x, y, 0, 0];
        } else if (data.solid) {
            return [x + data.wFactor * w, y + data.hFactor * h, w * data.sx, h * data.sy];
        } else {
            return [x + data.wFactor * w, y + data.hFactor * h,
                (w + data.insetWRel * w) * data.sx,
                (h + data.insetHRel * h) * data.sy];
        }
    }
}

function imageSrcPromise(image, src, originalSource) {
    image.src = src;
    return new Promise((resolve, reject) => {
        image.onload = () => {
            resolve();
        };
        image.onerror = (_meaninglessError) => {
            // The error parameter doesn't contain details, so just replacing it.
            reject(new Error(`Failed to load image from '${originalSource}'`));
        };
    });
}

function dataPromiseToImage(dataPromise, source) {
    const image = new window.Image();

    const promise = dataPromise
        .then((data) => {
            return imageSrcPromise(image, data, source);
        })
        .catch((_error) => {
            // HTTP request failed; may be running on localhost, so try loading without HTTP.
            return imageSrcPromise(image, source, source);
        });

    return { image, promise };
}

export function loadImage(state, source, sizeBytes) {
    let { promise, loadingID } = loadData(state, source, sizeBytes, 'image');
    let image;
    ({ image, promise } = dataPromiseToImage(promise, source));
    finalizeLoadingPromise(state, loadingID, promise);
    return image;
}

export function loadIcon(state, source, ax, ay, diameter, sizeBytes) {
    const icon = new Icon();

    if (isString(source) || source instanceof window.URL) {
        let { promise, loadingID } = loadData(state, source, sizeBytes, 'image');
        let image;
        ({ image, promise } = dataPromiseToImage(promise, source));
        icon.image = image;

        promise = promise.then(() => {
            icon.layout = computeLayout(ax, ay, diameter, image.width, image.height, 0, 0,
                image.width, image.height, true);
        });

        finalizeLoadingPromise(state, loadingID, promise);
    } else {
        // Assuming source parameter is a drawable object so just use it directly.
        icon.image = source;
        icon.layout = computeLayout(ax, ay, diameter, source.width, source.height, 0, 0,
            source.width, source.height, true);
    }

    return icon;
}

export function reloadIcon(state, icon, source, ax, ay, diameter) {
    let loadId;
    if (state.skid.load) {
        loadId = startLoading(state, 0);
    }

    let { image, promise } = dataPromiseToImage(reloadData(state, source, 'image'), source);
    promise = promise.then(() => {
        // TODO: Putting this line here instead of outside of the promise reduces flicker but also
        // introduces a race condition.
        // TODO: Need a way to mark an image load as canceled.
        icon.image = image;

        icon.layout = computeLayout(ax, ay, diameter, image.width, image.height, 0, 0,
            image.width, image.height, true);

        if (loadId) {
            doneLoading(state, loadId);
        }
        handle(state, 'icon_reloaded', icon);
        handle(state, 'request_draw');
    });
    finalizeLoadingPromise(state, undefined, promise);
}

function computeLayout(
    ax, ay, diameter, untrimmedWidth, untrimmedHeight, sourceX, sourceY, sourceW, sourceH, solid,
    localX, localY, localW, localH,
) {
    const layout = {};
    layout.x = sourceX;
    layout.y = sourceY;
    layout.w = sourceW;
    layout.h = sourceH;

    let axRel;
    if (isNaN(ax)) {
        axRel = 0.5;
    } else {
        axRel = ax / untrimmedWidth;
    }

    let ayRel;
    if (isNaN(ay)) {
        ayRel = 0.5;
    } else {
        ayRel = ay / untrimmedHeight;
    }

    if (isNaN(diameter)) {
        // fill square tile if no diameter is specified
        if (untrimmedHeight > untrimmedWidth) {
            layout.sx = 1;
            layout.sy = untrimmedHeight / untrimmedWidth;
        } else {
            layout.sy = 1;
            layout.sx = untrimmedWidth / untrimmedHeight;
        }
    } else {
        layout.sx = untrimmedWidth / diameter;
        layout.sy = untrimmedHeight / diameter;
    }

    if (solid) {
        layout.solid = true;
        layout.wFactor = layout.sx * -axRel;
        layout.hFactor = layout.sy * -ayRel;
    } else {
        // Corrects for seams in tile fields caused by precision loss
        // TODO: experiment with splitting numerator from denominator instead
        if (localX % 2 !== 0) {
            localX -= 1;
            localW += 1;
        }
        if (localY % 2 !== 0) {
            localY -= 1;
            localH += 1;
        }

        layout.insetWRel = (localW - untrimmedWidth) / untrimmedWidth;
        layout.insetHRel = (localH - untrimmedHeight) / untrimmedHeight;

        const insetXRel = localX / untrimmedWidth;
        const insetYRel = localY / untrimmedHeight;

        layout.wFactor = layout.sx * (insetXRel - axRel);
        layout.hFactor = layout.sy * (insetYRel - ayRel);
    }

    return layout;
}
