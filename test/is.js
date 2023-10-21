import assert from 'power-assert';
import { is } from '../src/is';

suite('is');

const configuration = [
    [[], 'defined', 'array', 'object', 'iterable'],
    [[4], 'defined', 'array', 'object', 'iterable'],
    ['asdf', 'defined', 'string', 'object', 'iterable'],
    ['', 'defined', 'string', 'object', 'iterable'],
    [{}, 'defined', 'object'],
    [{ a: 1 }, 'defined', 'object'],
    [true, 'defined', 'boolean'],
    [false, 'defined', 'boolean'],
    [1, 'defined', 'integer', 'number'],
    [0, 'defined', 'integer', 'number'],
    [-1, 'defined', 'integer', 'number'],
    [1.1, 'defined', 'number'],
    [-1.1, 'defined', 'number'],
    [NaN, 'defined'],
    [Infinity, 'defined'],
    [-Infinity, 'defined'],
    [null, 'nullish'],
    [undefined, 'nullish'],
    [() => {}, 'defined', 'function'],
    [function() {}, 'defined', 'function'],
    [function * () {}, 'defined', 'function', 'generatorFunction'],
];

for (const entry of configuration) {
    const item = entry[0];
    const methods = entry.slice(1);

    let title;
    if (Number.isNaN(item) || item === Infinity || item === -Infinity) {
        title = '' + item;
    } else if (typeof item === 'function') {
        title = '<function>';
    } else {
        title = JSON.stringify(item);
    }

    test(title, () => {
        for (const method of methods) {
            assert(is[method](item) === true);
        }
        for (const key of Object.keys(is)) {
            if (methods.indexOf(key) < 0) {
                assert(is[key](item) === false);
            }
        }
    });
}
