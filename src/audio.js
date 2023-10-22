import { extname } from 'path';
import { Howl, Howler } from 'howler';
import { loadData, errorLoading, finalizeLoadingPromise } from './load';
import { addHandler, handle } from './event';
import { isArray } from './is';

function load(state, eventCode, howlArgs) {
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

// Basic usage: loadAudio(state, 'click', { src: 'click.wav' });
//
// Plays 'click.wav' each time the 'click' event is triggered.
//
// To support multiple formats, pass an array of paths:
//
// loadAudio(state, 'click', { src: ['click.wav', 'click.ogg'] });
export function loadAudio(state, eventCode, howlArgs) {
    let src = howlArgs.src;
    if (!isArray(src)) {
        src = [src];
    }
    for (const path of src) {
        const extension = extname(path).substr(1);
        if (Howler.codecs(extension)) {
            let { promise, loadingID } = loadData(state, path, undefined);

            promise = promise.then(() => {
                const args = { ...howlArgs, src: howlArgs.src, format: [extension] };
                load(state, eventCode, args);
            });

            finalizeLoadingPromise(state, loadingID, promise);
            return;
        }
    }
    errorLoading(state, new Error(`Unsupported audio format: [${src}]`));
}

export function muted() {
    return Howler._muted;
}

export function setMuted(muted) {
    Howler.mute(muted);
}
