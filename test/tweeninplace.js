import assert from 'power-assert';
import { quake, sine } from '../src/tweeninplace';

suite('tween in place');

test('quake', () => {
    const quake1 = quake(1);
    assert(quake1(0) === 0);
    assert(quake1(1) === 0);
});

test('sine', () => {
    const sine1 = sine(1);
    assert(sine1(0) === 0);
    assert(Math.abs(sine1(0.5)) < 0.0001);
    assert(Math.abs(sine1(1)) < 0.0001);
});

test('invalid cycles', () => {
    assert.throws(() => {
        sine(0.4);
    });
});
