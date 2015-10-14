'use strict'
var Benchmark = require('benchmark')

var xInt = 4
var xFloat = 4.3
var result // to defeat escape analysis

new Benchmark.Suite('Vector Math')
.add('x * x (integer)', function() {
    result = xInt * xInt
})
.add('Math.pow(x, 2) (integer)', function() {
    result = Math.pow(xInt, 2)
})
.add('x * x (float)', function() {
    result = xFloat * xFloat
})
.add('Math.pow(x, 2) (float)', function() {
    result = Math.pow(xFloat, 2)
})
.on('cycle', function(event) {
    console.log(String(event.target))
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run()
