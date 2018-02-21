import {extname} from 'path';
import {Howl, Howler} from 'howler';
import {loadData, startLoading, doneLoading, errorLoading} from './load';
import {addHandler} from './event';

function load(state, eventCode, howlArgs, id) {
    return new Promise((resolve, reject) => {
        const sound = new Howl(howlArgs);
        addHandler(eventCode, () => sound.play());
        addHandler(`${eventCode}_stop`, () => sound.stop());
        sound.once('loaderror', (id, error) => errorLoading(state));
        sound.once('load', () => {
            resolve(sound);
            doneLoading(state, id);
        });
    });
}

export function loadAudio(state, eventCode, howlArgs) {
    const id = startLoading(state, 0); // 0 size so 'load_progress' event can fire
    let src = howlArgs.src;
    if (!Array.isArray(src)) src = [src];
    for (const path of src) {
        const extension = extname(path).substr(1);
        if (Howler.codecs(extension)) {
            return loadData(state, path).then((source) => {
                const args = { ...howlArgs, src: [source], format: [extension] };
                return load(state, eventCode, args, id);
            });
        }
    }
    setTimeout(() => errorLoading(state), 0); // Needs to be async call
    return new Promise(() => {});
}

export function muted() {
    return Howler._muted;
}

export function setMuted(muted) {
    Howler.mute(muted);
}
