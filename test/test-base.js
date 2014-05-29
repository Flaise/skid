
function pass(message) { ok(true, message) }

function fail(message) { ok(false, message) }

function expectSequence(arr, message) {
    var i = 0
    return function(subject) {
        if(i >= arr.length) fail('Expected only ' + arr.length + ' sequence assertions for ' + message)
        strictEqual(subject, arr[i], message)
        i += 1
    }
}

function expectMultiSequence(arr, message) {
    var i = 0
    return function(__varargs__) {
        if(i >= arr.length) {
            fail('Expected only ' + arr.length + ' sequence assertions for ' + message)
            return
        }
        deepEqual(Array.prototype.slice.call(arguments, 0), arr[i], message)
        i += 1
    }
}
