// Run this with:
// $ ./node_modules/babel/bin/babel-node.js ./benchmarks/array-iteration.js

var Benchmark = require('benchmark')
var makeArray = require('./make-array').make

var a = makeArray()
var b = makeArray()
var c = makeArray()
var d = makeArray()
var e = makeArray()
var f = makeArray()
var g = makeArray()
var h = makeArray()
var i = makeArray()
var j = makeArray()
var k = makeArray()

function loopBody(element) { element + 1 }

new Benchmark.Suite('Filtering')
.add('Array#forEach', function() {
    a.forEach(function(element) { element + 1 })
})
.add('simple for', function() {
    for(var i = 0; i < b.length; i += 1)
        b[i] + 1
})
.add('for of', function() {
    for(let element of c)
        element + 1
})
.add('Array#forEach (no allocation)', function() {
    d.forEach(loopBody)
})
.on('cycle', function(event) {
    console.log(String(event.target))
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run()
