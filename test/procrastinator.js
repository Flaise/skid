import Procrastinator from '../src/procrastinator'
import assert from 'power-assert'
import lolex from 'lolex'
import sinon from 'sinon'

suite('procrastinator')

let clock, proc, callback

before(() => {
    clock = lolex.install()
})

beforeEach(() => {
    callback = sinon.spy()
    proc = new Procrastinator(50)
})

after(() => {
    clock.uninstall()
})

test('callback is called after delay', () => {
    assert(!callback.called)
    proc.doItLater(callback)
    assert(!callback.called)
    clock.tick(49)
    assert(!callback.called)
    clock.tick(1)
    assert(callback.called)
})

test('resets delay', () => {
    assert(!callback.called)
    proc.doItLater(callback)
    assert(!callback.called)
    clock.tick(10)
    assert(!callback.called)
    proc.doItLater()
    assert(!callback.called)
    clock.tick(50)
    assert(callback.called)
})

test('does nothing when no callback given', () => {
    proc.doItLater()
    clock.tick(50)
})
