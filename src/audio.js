import {extname} from 'path';
import {Howl, Howler} from 'howler';
import {loadData, startLoading, doneLoading, errorLoading} from './load';
import {addHandler, handle} from './event';

function load(state, eventCode, howlArgs, id) {
    const sound = new Howl(howlArgs);
    sound.once('loaderror', (id, error) => errorLoading(state));
    sound.once('load', () => {
        doneLoading(state, id);
        handle(state, `${eventCode}_load_done`, sound);
    });
    return sound;
}

export function loadAudio(state, eventCode, howlArgs) {
    const id = startLoading(state, 0); // 0 size so 'load_progress' event can fire
    let src = howlArgs.src;
    if (!Array.isArray(src)) src = [src];
    for (const path of src) {
        const extension = extname(path).substr(1);
        if (Howler.codecs(extension)) {
            let sound;
            loadData(state, path, undefined, () => Promise.resolve(howlArgs.src))
                .then((source) => {
                    const args = { ...howlArgs, src: source, format: [extension] };
                    sound = load(state, eventCode, args, id);
                });

            addHandler(eventCode, () => {
                if (sound) sound.play();
            });
            addHandler(`${eventCode}_stop`, () => {
                if (sound) sound.stop();
            });
            return;
        }
    }
    errorLoading(state);
}

export function muted() {
    return Howler._muted;
}

export function setMuted(muted) {
    Howler.mute(muted);
}
