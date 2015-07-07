

module('EventDispatcher')
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
