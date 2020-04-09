import {PieAvatar} from '../scene/pie-avatar';
import {Translation} from '../scene/translation';
import {TextAvatar} from '../scene/text-avatar';
import {Camera} from '../scene/camera';
import {addHandler, handle} from '../event';

export function initPreloader(state, camera, fillStyle = 'black') {
    const meter = new PieAvatar(state, camera);
    meter.x.setTo(.5);
    meter.y.setTo(camera.h.curr / 2);
    meter.w.setTo(.03);
    meter.h.setTo(.03);
    meter.fillStyle = fillStyle;
    meter.innerRadiusRel.setTo(.6);

    const textPosition = new Translation(state, camera);
    textPosition.x.setTo(.5);
    textPosition.y.setTo(camera.h.curr / 2 + .032);

    const text = new TextAvatar(state, textPosition, camera);
    text.textAlign = 'center';
    text.textBaseline = 'top';
    text.fillStyle = fillStyle;
    text.font = '18px verdana';
    text.text = 'Loading...';

    state.skid.preloader = {meter, textPosition, text};
}

addHandler('load_progress', (state, progress) => {
    state.skid.preloader.meter.breadth.setTo(-progress);
});

addHandler('load_error', (state) => {
    state.skid.preloader.meter.fillStyle = '#b00';
    state.skid.preloader.text.fillStyle = '#b00';
    state.skid.preloader.text.text = `Error`;
});

addHandler('load_done', (state) => {
    state.skid.preloader.meter.remove();
    state.skid.preloader.textPosition.remove();
    state.skid.preloader.text.remove();
    state.skid.preloader = undefined;
    handle(state, 'request_draw');
});
