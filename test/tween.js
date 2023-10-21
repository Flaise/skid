import assert from 'power-assert';
import * as tween from '../src/tween';

suite('tween');

const funcs = [];
for (const key of Object.keys(tween)) {
    if (!/.*Fac$/.test(key)) {
        funcs.push(tween[key]);
    }
}
funcs.push(tween.powerFac(1));
funcs.push(tween.powerFac(2));
funcs.push(tween.powerFac(3));
funcs.push(tween.powerFac(1.5));

for (const func of funcs) {
    test(func.name, () => {
        assert(func(0) === 0);
        assert(Math.abs(func(1) - 1) < 0.0001); // reverseSine isn't perfectly precise
    });
}
