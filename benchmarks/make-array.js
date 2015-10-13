'use strict'

exports.make = function makeArray() {
    var arr = []
    for(var i = 0; i < 1000; i += 1)
        arr.push(i)
    return arr
}
