const {Icon} = require('./scene/icon');
const {handle} = require('./event');

export function load(state) {
    state.load = {requests: 0, done: false};

    handle(state, 'load');
    if (state.load.requests === 0) {
        state.load.done = true;
        handle(state, 'load_done');
    }
}

function loaded(state, image) {
    image.onload = image.onerror = undefined;
    state.load.requests -= 1;
    handle(state, 'load_progress'); // TODO: needs parameter with amount of progress
    if (!state.load.done && state.load.requests === 0) {
        state.load.done = true;
        handle(state, 'load_done');
    }
}

function loadImage(state, source, onload) {
    state.load.requests += 1;
    const image = new window.Image();
    image.onload = () => {
        loaded(state, image);
        onload(image);
    };
    image.onerror = () => {
        console.error(`Unable to load image ${source}`);
        loaded(state, image);
    };
    image.src = source;
    return image;
}

export function loadIcon(state, source, ax, ay, diameter) {
    if (typeof source === 'string') {
        const icon = new Icon();
        loadImage(state, source, (image) => {
            icon.image = image;
            icon.layout = computeLayout(ax, ay, diameter, image.width, image.height, 0, 0,
                                        image.width, image.height, true);
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
