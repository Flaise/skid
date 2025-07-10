import { extname } from 'path';
import { Howl, Howler } from 'howler';
import { loadData, errorLoading, finalizeLoadingPromise } from './load.js';
import { addHandler, handle } from './event.js';
import { isArray, isDefined } from './is.js';

function loadHowl(state, eventCode, howlArgs) {
    const sound = new Howl(howlArgs);

    addHandler(eventCode, () => {
        sound.play();
    });
    addHandler(`${eventCode}_stop`, () => {
        sound.stop();
    });

    return new Promise((resolve, reject) => {
        sound.once('loaderror', (_id, error) => {
            reject(error);
        });
        sound.once('load', () => {
            handle(state, `${eventCode}_load_done`, sound);
            resolve();
        });
    });
}

// Basic usage: loadAudio(state, 'click', { src: 'click.wav' }, 1234);
//
// Plays 'click.wav' each time the 'click' event is triggered. The last argument is the size of
// the file in bytes.
//
// To support multiple formats, pass an array of paths:
//
// loadAudio(state, 'click', { src: ['click.wav', 'click.ogg'] }, [1234, 2345]);
export function loadAudio(state, eventCode, howlArgs, sizeBytes) {
    let src = howlArgs.src;
    if (!isDefined(src)) {
        errorLoading(state, new Error('Missing field `src` from parameter howlArgs.'));
        return;
    }
    if (!isArray(src)) {
        src = [src];
    }
    if (!isArray(sizeBytes)) {
        sizeBytes = [sizeBytes]; // `[undefined]` is acceptable
    }

    for (let i = 0; i < src.length; i += 1) {
        let path = src[i];
        if (path instanceof window.URL) {
            path = path.href;
        }

        const beforeQuery = path.split('?')[0];
        const extension = extname(beforeQuery).substring(1);
        if (Howler.codecs(extension)) {
            let { promise, loadingID } = loadData(state, path, sizeBytes[i], 'audio');

            promise = promise.then(() => {
                const args = { ...howlArgs, src: path, format: [extension] };
                return loadHowl(state, eventCode, args);
            });

            finalizeLoadingPromise(state, loadingID, promise);
            return;
        }
    }
    // None of the source URLs have file name extensions that are supported by this browser.
    // Usually a bad input. Who doesn't support at least .ogg or .mp3?
    errorLoading(state, new Error(`Unsupported audio format(s): [${src}]`));
}

export function muted() {
    return Howler._muted;
}

export function setMuted(muted) {
    Howler.mute(muted);
}
