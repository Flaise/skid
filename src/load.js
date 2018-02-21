const {Icon} = require('./scene/icon');
const {handle} = require('./event');

export function load(state) {
    state.load = {requests: 0, completions: 0, done: false, loaders: {}, error: false};

    handle(state, 'load');
    if (state.load.requests === 0) {
        state.load.done = true;
        handle(state, 'load_done');
    }
}

export function startLoading(state, size) {
    if (state.load.done) throw new Error("load assets during the 'load' event");
    state.load.requests += 1;
    const id = state.load.requests;
    if (size != undefined) progressLoading(state, id, 0, size);
    return id;
}

export function progressLoading(state, id, loaded, total) {
    if (state.load.done) throw new Error("load assets during the 'load' event");
    if (state.load.error) return;
    if (isNaN(loaded) || isNaN(total)) {
        loaded = 0;
        total = 0;
    }
    if (!state.load.loaders[id]) state.load.loaders[id] = {};
    state.load.loaders[id].loaded = loaded;
    state.load.loaders[id].total = total;

    if (Object.keys(state.load.loaders).length < state.load.requests) return;

    let allLoaded = 0;
    let allTotal = 0;
    for (const loader of Object.values(state.load.loaders)) {
        allLoaded += loader.loaded;
        allTotal += loader.total;
    }
    handle(state, 'load_progress', allLoaded / allTotal);
}

export function doneLoading(state, id) {
    if (state.load.done) throw new Error("load assets during the 'load' event");
    if (state.load.error) return;
    state.load.completions += 1;
    if (state.load.completions === state.load.requests) {
        state.load.done = true;
        handle(state, 'load_done');
    }
}

export function errorLoading(state) {
    if (state.load.error) return;
    state.load.error = true;
    handle(state, 'load_error');
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

export function loadData(state, imageUrl, total) {
    const id = startLoading(state, total);
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', imageUrl, true);
        xhr.responseType = 'arraybuffer';

        xhr.onprogress = (event) => {
            if (event.lengthComputable) {
                progressLoading(state, id, event.loaded, event.total);
            }
        };

        xhr.onloadend = () => {
            if (!xhr.status.toString().match(/^2/)) {
                errorLoading(state);
                return;
            }

            const options = {};
            const headers = xhr.getAllResponseHeaders();
            const match = headers.match(/^Content-Type\:\s*(.*?)$/mi);

            if (match && match[1]) {
                options.type = match[1];
            }

            const blob = new Blob([xhr.response], options);
            progressLoading(state, id, blob.size, blob.size);
            resolve(window.URL.createObjectURL(blob));
            doneLoading(state, id);
        }

        xhr.send();
    });
}
