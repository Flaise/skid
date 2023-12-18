import assert from 'power-assert';
import { inspect } from 'util';
import * as functions from '../src/is.js';

suite('is');

const configuration = [
    [[], 'isDefined', 'isArray', 'isObject', 'isIterable'],
    [[4], 'isDefined', 'isArray', 'isObject', 'isIterable'],
    ['asdf', 'isDefined', 'isString', 'isObject', 'isIterable'],
    ['', 'isDefined', 'isString', 'isObject', 'isIterable'],
    [{}, 'isDefined', 'isObject', 'isHash'],
    [{ a: 1 }, 'isDefined', 'isObject', 'isHash'],
    [true, 'isDefined', 'isBoolean'],
    [false, 'isDefined', 'isBoolean'],
    [1, 'isDefined', 'isInteger', 'isNumber'],
    [0, 'isDefined', 'isInteger', 'isNumber'],
    [-1, 'isDefined', 'isInteger', 'isNumber'],
    [1.1, 'isDefined', 'isNumber'],
    [-1.1, 'isDefined', 'isNumber'],
    [NaN, 'isDefined'],
    [Infinity, 'isDefined'],
    [-Infinity, 'isDefined'],
    [null, 'isNullish'],
    [undefined, 'isNullish'],
    [() => {}, 'isDefined', 'isFunction'],
    [function() {}, 'isDefined', 'isFunction'],
    [function* () {}, 'isDefined', 'isFunction', 'isGeneratorFunction'],
];

for (const entry of configuration) {
    const item = entry[0];
    const methods = entry.slice(1);
    const title = inspect(item, { depth: 0 });

    test(title, () => {
        for (const method of methods) {
            assert(functions[method] != null);
            assert(functions[method](item) === true);
        }
        for (const key of Object.keys(functions)) {
            if (methods.indexOf(key) < 0) {
                assert(functions[key](item) === false);
            }
        }
    });
}
