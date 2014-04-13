

module('EventDispatcher')
test('notifying a single listener', 1, function() {
    var dispatcher = new EventDispatcher()
    dispatcher.listen(pass)
    dispatcher.proc()
})
test('notifying multiple listeners', 3, function() {
    var dispatcher = new EventDispatcher()
    for(var i = 0; i < 3; i += 1)
        dispatcher.listen(pass)
    dispatcher.proc()
})
test('passing one parameter to listeners', 3, function() {
    var dispatcher = new EventDispatcher()
    var param = {}
    for(var i = 0; i < 3; i += 1)
        dispatcher.listen(function(a) {
            strictEqual(param, a)
        })
    dispatcher.proc(param)
})
test('passing two parameters to listeners', 6, function() {
    var dispatcher = new EventDispatcher()
    var param1 = {}
    var param2 = {}
    for(var i = 0; i < 3; i += 1)
        dispatcher.listen(function(a, b) {
            strictEqual(param1, a)
            strictEqual(param2, b)
        })
    dispatcher.proc(param1, param2)
})
test('removing a listener', 0, function() {
    var dispatcher = new EventDispatcher()
    dispatcher.listen(fail)()
    dispatcher.proc()
})
test('removing one of many listeners', 3, function() {
    var dispatcher = new EventDispatcher()
    dispatcher.listen(pass)
    dispatcher.listen(pass)
    dispatcher.listen(fail)()
    dispatcher.listen(pass)
    dispatcher.proc()
})
test('removal during iteration', 5, function() {
    var dispatcher = new EventDispatcher()
    dispatcher.listen(pass)
    var remove = dispatcher.listen(function() {
        remove()
        pass()
    })
    dispatcher.listen(pass)
    dispatcher.proc() // 3 calls
    dispatcher.proc() // 2 calls
})
test('multiple instance notification', 2, function() {
    var dispatcherA = new EventDispatcher()
    var dispatcherB = new EventDispatcher()
    dispatcherA.listen(function(param) {
        deepEqual(param, 1)
    })
    dispatcherB.listen(function(param) {
        deepEqual(param, 'asdf')
    })
    dispatcherA.proc(1)
    dispatcherB.proc('asdf')
})
test('listenOnce', 1, function() {
    var dispatcher = new EventDispatcher()
    dispatcher.proc('asdf')
    dispatcher.listenOnce(pass)
    dispatcher.proc(1)
    dispatcher.proc(-9)
})
test('remove a listen-once callback before proc', 0, function() {
    var dispatcher = new EventDispatcher()
    dispatcher.listenOnce(fail)() // calling return value
    dispatcher.proc()
})
test('concurrent listenOnce without breaking iteration', 3, function() {
    var dispatcher = new EventDispatcher()
    dispatcher.listenOnce(pass)
    dispatcher.listen(pass)
    dispatcher.proc(1)
    dispatcher.proc(2)
})
test('removal listener registration', function() {
    var onRemove = new EventDispatcher()
    var dispatcher = new EventDispatcher()

    dispatcher.listen(function(a) { strictEqual(a, 'a') }).until(onRemove)
    dispatcher.proc('a')
    onRemove.proc()
    dispatcher.proc('b')

    strictEqual(dispatcher.callbacks.empty, true)
    strictEqual(onRemove.callbacks.empty, true)
})
test('removal listener deregistration on manual removal call', function() {
    var onRemove = new EventDispatcher()
    var dispatcher = new EventDispatcher()

    var removal = dispatcher.listen(fail)
    removal.until(onRemove)
    removal()

    strictEqual(dispatcher.callbacks.empty, true)
    strictEqual(onRemove.callbacks.empty, true)
})
test('removal listener registration for listenOnce', function() {
    var onRemove = new EventDispatcher()
    var dispatcher = new EventDispatcher()

    dispatcher.listenOnce(function(a) { strictEqual(a, 'a') }).until(onRemove)
    dispatcher.proc('a')

    strictEqual(dispatcher.callbacks.empty, true)
    strictEqual(onRemove.callbacks.empty, true)

    dispatcher.listenOnce(function(a) { strictEqual(a, 'a') }).until(onRemove)
    onRemove.proc()
    dispatcher.proc('b')

    strictEqual(dispatcher.callbacks.empty, true)
    strictEqual(onRemove.callbacks.empty, true)
})
test('removal listener deregistration on manual removal call for listenOnce', function() {
    var onRemove = new EventDispatcher()
    var dispatcher = new EventDispatcher()

    var removal = dispatcher.listenOnce(fail)
    removal.until(onRemove)
    removal()

    strictEqual(dispatcher.callbacks.empty, true)
    strictEqual(onRemove.callbacks.empty, true)
})
test('aggregation of two dispatchers', 2, function() {
    var a = new EventDispatcher()
    var b = new EventDispatcher()
    var aggregation = a.aggregate(b)

    var impl = pass

    var removal = aggregation.listen(function() { impl() })
    a.proc()
    b.proc()
    removal()
    impl = fail
    a.proc()
    b.proc()
})
test('passing parameters to aggregation', 4, function() {
    var a = new EventDispatcher()
    var b = new EventDispatcher()
    var aggregation = a.aggregate(b)
    var removal = aggregation.listen(function(a, b) {
        strictEqual(a, 'asdf')
        strictEqual(b, -123)
    })
    a.proc('asdf', -123)
    b.proc('asdf', -123)
    removal()
    a.proc()
    b.proc()
})
test('no message sent to listeners added during procation', 1, function() {
    var dispatcher = new EventDispatcher()
    dispatcher.listen(function() {
        pass()
        dispatcher.listen(fail)
    })
    dispatcher.proc()
})
test('two consecutive once-only listeners getting called', 2, function() {
    var a = false
    var b = false
    var dispatcher = new EventDispatcher()
    dispatcher.listenOnce(function() { a = true })
    dispatcher.listenOnce(function() { b = true })
    dispatcher.proc()
    ok(a, 'first')
    ok(b, 'second')
})
test('two consecutive once-only listeners with an until hook', 2, function() {
    var a = false
    var b = false
    var dispatcher = new EventDispatcher()
    var end = new EventDispatcher()
    dispatcher.listenOnce(function() { a = true }).until(end)
    dispatcher.listenOnce(function() { b = true })
    dispatcher.proc()
    ok(a, 'first')
    ok(b, 'second')
})
test('two consecutive once-only listeners with an until hook that fires', function() {
    var a = false
    var b = false
    var dispatcher = new EventDispatcher()
    var end = new EventDispatcher()
    dispatcher.listenOnce(function() { a = true }).until(end)
    dispatcher.listenOnce(function() { b = true })
    end.proc()
    dispatcher.proc()
    ok(!a, 'first')
    ok(b, 'second')
})
