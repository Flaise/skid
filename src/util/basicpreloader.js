import { PieAvatar } from '../scene/pieavatar';
import { Translation } from '../scene/translation';
import { TextAvatar } from '../scene/textavatar';
import { addHandler, handle } from '../event';

export function initPreloader(state, camera, fillStyle = 'black') {
    const meter = new PieAvatar(state, camera);
    meter.layer = 1;
    meter.x.setTo(0.5);
    meter.y.setTo(camera.h.curr / 2);
    meter.w.setTo(0.03);
    meter.h.setTo(0.03);
    meter.fillStyle = fillStyle;
    meter.innerRadiusRel.setTo(0.6);

    const textPosition = new Translation(state, camera);
    textPosition.layer = 1;
    textPosition.x.setTo(0.5);
    textPosition.y.setTo(camera.h.curr / 2 + 0.032);

    const text = new TextAvatar(state, textPosition, camera);
    text.textAlign = 'center';
    text.textBaseline = 'top';
    text.fillStyle = fillStyle;
    text.font = '18px sans';
    text.text = 'Loading...';

    state.skid.preloader = { meter, textPosition, text };
}

addHandler('load_progress', (state, progress) => {
    if (!state.skid.preloader) {
        return;
    }
    state.skid.preloader.meter.breadth.setTo(-progress);
});

addHandler('load_error', (state) => {
    if (!state.skid.preloader) {
        return;
    }
    state.skid.preloader.meter.fillStyle = '#b00';
    state.skid.preloader.text.fillStyle = '#b00';
    state.skid.preloader.text.text = 'Error';
    handle(state, 'request_draw');
});

addHandler('load_done', (state) => {
    if (!state.skid.preloader) {
        return;
    }
    state.skid.preloader.meter.remove();
    state.skid.preloader.textPosition.remove();
    state.skid.preloader.text.remove();
    state.skid.preloader = undefined;
    handle(state, 'request_draw');
});
