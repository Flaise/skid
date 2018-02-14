import assert from 'power-assert'
import sinon from 'sinon'
import {EventDispatcher} from '../src/event-dispatcher'

suite('EventDispatcher')

let dispatcher, listenerA, listenerB, listenerC
beforeEach(() => {
    dispatcher = new EventDispatcher()
    listenerA = sinon.spy()
    listenerB = sinon.spy()
    listenerC = sinon.spy()
})

test('notifying a single listener', function() {
    dispatcher.listen(listenerA)
    dispatcher.proc()
    assert(listenerA.callCount === 1)
})
test('notifying multiple listeners', function() {
    dispatcher.listen(listenerA)
    dispatcher.listen(listenerB)
    dispatcher.listen(listenerC)
    dispatcher.proc()

    assert(listenerA.calledOnce)
    assert(listenerB.calledOnce)
    assert(listenerC.calledOnce)
})
test('passing one parameter to listeners', function() {
    const param = 'r'
    dispatcher.listen(listenerA)
    dispatcher.listen(listenerB)
    dispatcher.listen(listenerC)
    dispatcher.proc(param)

    assert.deepEqual(listenerA.args, [[param]])
    assert.deepEqual(listenerB.args, [[param]])
    assert.deepEqual(listenerC.args, [[param]])
})
test('passing two parameters to listeners', function() {
    const param1 = 'a'
    const param2 = 'b'
    dispatcher.listen(listenerA)
    dispatcher.listen(listenerB)
    dispatcher.listen(listenerC)
    dispatcher.proc('a', 'b')

    assert.deepEqual(listenerA.args, [['a', 'b']])
    assert.deepEqual(listenerB.args, [['a', 'b']])
    assert.deepEqual(listenerC.args, [['a', 'b']])
})
test('removing a listener', function() {
    dispatcher.listen(listenerA).stop()
    dispatcher.proc()
    assert(listenerA.callCount === 0)
})
test('removing one of many listeners', function() {
    dispatcher.listen(listenerA)
    dispatcher.listen(listenerB).stop()
    dispatcher.listen(listenerC)
    dispatcher.proc()
    assert(listenerA.calledOnce)
    assert(!listenerB.callCount)
    assert(listenerC.calledOnce)
})
test('removal during iteration', function() {
    dispatcher.listen(listenerA)
    const listenerR = sinon.spy(() => reg.stop())
    const reg = dispatcher.listen(listenerR)
    dispatcher.listen(listenerB)
    dispatcher.proc()
    dispatcher.proc()
    assert(listenerA.calledTwice)
    assert(listenerB.calledTwice)
    assert(listenerR.calledOnce)
})
test('listenOnce', function() {
    dispatcher.proc('asdf')
    dispatcher.listenOnce(listenerA)
    dispatcher.proc(1)
    dispatcher.proc(-9)
    assert.deepEqual(listenerA.args, [[1]])
})
test('remove a listen-once callback before proc', function() {
    dispatcher.listenOnce(listenerA).stop()
    dispatcher.proc()
    assert(listenerA.callCount === 0)
})
test('concurrent listenOnce without breaking iteration', function() {
    dispatcher.listenOnce(listenerA)
    dispatcher.listen(listenerB)
    dispatcher.proc(1)
    dispatcher.proc(2)
    assert(listenerA.calledOnce)
    assert(listenerB.calledTwice)
})
test('concurrent listenOnce without breaking iteration - other order', function() {
    dispatcher.listen(listenerB)
    dispatcher.listenOnce(listenerA)
    dispatcher.proc(1)
    dispatcher.proc(2)
    assert(listenerA.calledOnce)
    assert(listenerB.calledTwice)
})
test.skip('removal listener registration', function() {
    var onRemove = new EventDispatcher()


    dispatcher.listen(function(a) { assert(a === 'a') }).until(onRemove)
    dispatcher.proc('a')
    onRemove.proc()
    dispatcher.proc('b')

    assert(dispatcher.callbacks.empty === true)
    assert(onRemove.callbacks.empty === true)
})
test.skip('removal listener deregistration on manual removal call', function() {
    var onRemove = new EventDispatcher()

    var removal = dispatcher.listen(listenerA)
    removal.until(onRemove)
    removal()

    assert(listenerA.callCount === 0)
    assert(dispatcher.callbacks.empty === true)
    assert(onRemove.callbacks.empty === true)
})
test.skip('removal listener registration for listenOnce', function() {
    var onRemove = new EventDispatcher()


    dispatcher.listenOnce(function(a) { assert(a === 'a') }).until(onRemove)
    dispatcher.proc('a')

    assert(dispatcher.callbacks.empty === true)
    assert(onRemove.callbacks.empty === true)

    dispatcher.listenOnce(function(a) { assert(a === 'a') }).until(onRemove)
    onRemove.proc()
    dispatcher.proc('b')

    assert(dispatcher.callbacks.empty === true)
    assert(onRemove.callbacks.empty === true)
})
test.skip('removal listener deregistration on manual removal call for listenOnce', function() {
    var onRemove = new EventDispatcher()


    var removal = dispatcher.listenOnce(fail)
    removal.until(onRemove)
    removal()

    assert(dispatcher.callbacks.empty === true)
    assert(onRemove.callbacks.empty === true)
})
test('aggregation of two dispatchers', function() {
    var a = new EventDispatcher()
    var b = new EventDispatcher()
    var aggregation = a.aggregate(b)
    var reg = aggregation.listen(listenerA)
    a.proc(1)
    b.proc(2)
    reg.stop()
    a.proc(3)
    b.proc(4)
    assert.deepEqual(listenerA.args, [[1], [2]])
})
test('passing parameters to aggregation', function() {
    const a = new EventDispatcher()
    const b = new EventDispatcher()
    const aggregation = a.aggregate(b)
    const reg = aggregation.listen(listenerA)
    a.proc('asdf', -123)
    b.proc('asd', -12)
    reg.stop()
    a.proc()
    b.proc()
    assert.deepEqual(listenerA.args, [
        ['asdf', -123],
        ['asd', -12]
    ])
})
test('no message sent to listeners added during procation', function() {
    const listenerR = sinon.spy(() => dispatcher.listen(listenerA))
    dispatcher.listen(listenerR)
    dispatcher.proc()
    assert(listenerR.calledOnce)
    assert(listenerA.callCount === 0)
})
test('two consecutive once-only listeners getting called', function() {
    dispatcher.listenOnce(listenerA)
    dispatcher.listenOnce(listenerB)
    dispatcher.proc()
    assert(listenerA.calledOnce)
    assert(listenerB.calledOnce)
})
test.skip('two consecutive once-only listeners with an until hook', function() {
    var a = false
    var b = false

    var end = new EventDispatcher()
    dispatcher.listenOnce(function() { a = true }).until(end)
    dispatcher.listenOnce(function() { b = true })
    dispatcher.proc()
    ok(a, 'first')
    ok(b, 'second')
})
test.skip('two consecutive once-only listeners with an until hook that fires', function() {
    var a = false
    var b = false

    var end = new EventDispatcher()
    dispatcher.listenOnce(function() { a = true }).until(end)
    dispatcher.listenOnce(function() { b = true })
    end.proc()
    dispatcher.proc()
    ok(!a, 'first')
    ok(b, 'second')
})

test.skip('removal during iteration', () => {
    const remover = sinon.spy(() => reg.stop())

    dispatcher.listen(remover)
    const reg = dispatcher.listen(listenerB)

    dispatcher.proc()
    assert(remover.calledOnce)
    assert(listenerB.callCount === 0)
})

test("can't listen with non-function", () => {
    for(let element of [undefined, null, 1, NaN, '', "asdf", -1.04, Infinity]) {
        assert.throws(() => dispatcher.listen(element))
        assert.throws(() => dispatcher.listenOnce(element))
    }
})
