const {Icon} = require('./scene/icon');
const {handle} = require('./event');

export function load(debug) {
    const state = Object.create(null);
    if (debug) {
        state.debug = true;
        window.getState = () => state;
    }
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
