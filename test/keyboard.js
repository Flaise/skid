import assert from 'power-assert'
import simulate from 'simulate-dom-event'
import {stateOf, reset} from '../src/keyboard'
import * as key from '../src/key'

suite('keyboard')

const keyCodes = Object.keys(key).filter(a => a !== 'nameOf').map(a => key[a])

beforeEach(() => {
    reset()
})

test('everything is initially unpressed', () => {
    for(let k of keyCodes)
        assert(stateOf(k) === false)
})

test('keydown event changes key state', () => {
    for(let k of keyCodes) {
        simulate(window, 'keydown', {keyCode: k})
        assert(stateOf(k) === true)
    }
})
