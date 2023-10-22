import { handle } from './event';
import { isDefined } from './is';

let started = false;

export function start() {
    if (process.env.NODE_ENV !== 'production') {
        if (arguments.length > 0) {
            throw new Error('start() takes no arguments');
        }
    }

    if (started) {
        throw new Error('call start() only once');
    }
    started = true;
    const state = Object.create(null);
    state.skid = Object.create(null);
    if (typeof window !== 'undefined') {
        window.getState = () => state;
    }
    state.skid.load = { requests: 0, completions: 0, loaders: {}, error: false };

    if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
            doLoad(state);
        });
    } else {
        doLoad(state);
    }
}

function doLoad(state) {
    handle(state, 'load');
    if (state.skid.load.requests === 0) {
        state.skid.load = undefined;
        handle(state, 'load_done');
    }
}

export function startLoading(state, size) {
    if (!state.skid.load) {
        throw new Error("load assets during the 'load' event");
    }
    state.skid.load.requests += 1;
    const id = state.skid.load.requests;
    if (size != null) {
        progressLoading(state, id, 0, size);
    }
    return id;
}

export function progressLoading(state, id, loaded, total) {
    if (!state.skid.load) {
        throw new Error("load assets during the 'load' event");
    }
    if (state.skid.load.error) {
        return;
    }
    if (isNaN(loaded) || isNaN(total)) {
        loaded = 0;
        total = 0;
    }
    if (!state.skid.load.loaders[id]) {
        state.skid.load.loaders[id] = {};
    }
    state.skid.load.loaders[id].loaded = loaded;
    state.skid.load.loaders[id].total = total;

    if (Object.keys(state.skid.load.loaders).length < state.skid.load.requests) {
        return;
    }

    let allLoaded = 0;
    let allTotal = 0;
    for (const loader of Object.values(state.skid.load.loaders)) {
        allLoaded += loader.loaded;
        allTotal += loader.total;
    }
    let progress = allLoaded / allTotal;
    if (allTotal === 0) {
        progress = 0;
    }
    handle(state, 'load_progress', progress);
}

export function doneLoading(state, id) {
    if (!state.skid.load) {
        throw new Error("load assets during the 'load' event");
    }
    if (state.skid.load.error) {
        return;
    }
    state.skid.load.completions += 1;
    if (state.skid.load.completions === state.skid.load.requests) {
        state.skid.load = undefined;
        handle(state, 'load_done');
    }
}

export function errorLoading(state, error) {
    if (state.skid.load.error) {
        return;
    }
    state.skid.load.error = true;
    handle(state, 'load_error', error);
}

export function reloadData(state, url) {
    return doXHR(state, undefined, url, false);
}

export function loadData(state, url, total) {
    const loadingID = startLoading(state, total);
    return { promise: doXHR(state, loadingID, url, true), loadingID };
}

function doXHR(state, id, url, showProgress) {
    const promise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        // just need nonzero placeholder until actual byte count is known
        let lastKnownTotal = 1;

        if (showProgress) {
            progressLoading(state, id, 0, lastKnownTotal);

            xhr.onprogress = (event) => {
                if (event.lengthComputable) {
                    progressLoading(state, id, event.loaded, event.total);

                    lastKnownTotal = event.total;
                }
            };
        }

        xhr.onloadend = () => {
            const blob = xhrToBlob(xhr);

            let data;
            if (blob) {
                if (showProgress) {
                    lastKnownTotal = blob.size;
                }
                data = window.URL.createObjectURL(blob);
            }

            if (showProgress) {
                progressLoading(state, id, lastKnownTotal, lastKnownTotal);
            }

            if (data) {
                resolve(data);
            } else {
                reject(new Error(`Failed to load ${url}`));
            }
        };

        // Explicitly moving to next turn of event loop because some errors will happen
        // synchronously and Skid needs all outputs from this operation to be asynchronous.
        setTimeout(() => xhr.send());
    });
    return promise;
}

export function finalizeLoadingPromise(state, loadingID, promise) {
    promise
        .then(() => {
            if (isDefined(loadingID)) {
                doneLoading(state, loadingID);
            }
        })
        .catch((error) => {
            errorLoading(state, error);
            throw error; // makes it show up in the console
        });
}

function xhrToBlob(xhr) {
    if (xhr.status.toString().match(/^2/)) {
        const options = {};
        const headers = xhr.getAllResponseHeaders();
        const match = headers.match(/^Content-Type:\s*(.*?)$/mi);

        if (match && match[1]) {
            options.type = match[1];
        }

        return new Blob([xhr.response], options);
    }
    return undefined;
}
