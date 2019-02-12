const {Icon} = require('./scene/icon');
const {handle} = require('./event');

let started = false;

export function start(debug) {
    if (started) throw new Error('call start() only once');
    started = true;
    const state = Object.create(null);
    state.skid = Object.create(null);
    if (debug) {
        state.skid.debug = true;
    }
    if (typeof window !== 'undefined') {
        window.getState = () => state;
    }
    state.skid.load = {requests: 0, completions: 0, loaders: {}, error: false};

    if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
            handle(state, 'load');
            if (state.skid.load.requests === 0) {
                state.skid.load = undefined;
                handle(state, 'load_done');
            }
        });
    } else {
        handle(state, 'load');
        if (state.skid.load.requests === 0) {
            state.skid.load = undefined;
            handle(state, 'load_done');
        }
    }
}

export function startLoading(state, size) {
    if (!state.skid.load) throw new Error("load assets during the 'load' event");
    state.skid.load.requests += 1;
    const id = state.skid.load.requests;
    if (size != undefined) progressLoading(state, id, 0, size);
    return id;
}

export function progressLoading(state, id, loaded, total) {
    if (!state.skid.load) throw new Error("load assets during the 'load' event");
    if (state.skid.load.error) return;
    if (isNaN(loaded) || isNaN(total)) {
        loaded = 0;
        total = 0;
    }
    if (!state.skid.load.loaders[id]) state.skid.load.loaders[id] = {};
    state.skid.load.loaders[id].loaded = loaded;
    state.skid.load.loaders[id].total = total;

    if (Object.keys(state.skid.load.loaders).length < state.skid.load.requests) return;

    let allLoaded = 0;
    let allTotal = 0;
    for (const loader of Object.values(state.skid.load.loaders)) {
        allLoaded += loader.loaded;
        allTotal += loader.total;
    }
    let progress = allLoaded / allTotal;
    if (allTotal === 0) progress = 0;
    handle(state, 'load_progress', progress);
}

export function doneLoading(state, id) {
    if (!state.skid.load) throw new Error("load assets during the 'load' event");
    if (state.skid.load.error) return;
    state.skid.load.completions += 1;
    if (state.skid.load.completions === state.skid.load.requests) {
        state.skid.load = undefined;
        handle(state, 'load_done');
    }
}

export function errorLoading(state) {
    if (state.skid.load.error) return;
    state.skid.load.error = true;
    handle(state, 'load_error');
}

export function reloadData(state, url, alternate) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onloadend = () => {
            if (!xhr.status.toString().match(/^2/)) {
                if (alternate) {
                    // Fallback for file:// protocol
                    alternate()
                        .then((result) => {
                            resolve(result);
                        })
                        // TODO: .catch(() => ...);
                } else {
                    // TODO: report error
                }
                return;
            }

            const options = {};
            const headers = xhr.getAllResponseHeaders();
            const match = headers.match(/^Content-Type\:\s*(.*?)$/mi);

            if (match && match[1]) {
                options.type = match[1];
            }

            const blob = new Blob([xhr.response], options);
            resolve(window.URL.createObjectURL(blob));
        };

        setTimeout(() => xhr.send()); // Errors must happen asynchronously.
    });
}

export function loadData(state, url, total, alternate) {
    const id = startLoading(state, total);
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onprogress = (event) => {
            if (event.lengthComputable) {
                progressLoading(state, id, event.loaded, event.total);
            }
        };

        xhr.onloadend = () => {
            if (!xhr.status.toString().match(/^2/)) {
                if (alternate) {
                    // Fallback for file:// protocol
                    alternate()
                        .then((result) => {
                            progressLoading(state, id, 1, 1);
                            resolve(result);
                            doneLoading(state, id);
                        })
                        .catch(() => errorLoading(state));
                } else {
                    errorLoading(state);
                }
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
        };

        setTimeout(() => xhr.send()); // Errors must happen asynchronously.
    });
}
