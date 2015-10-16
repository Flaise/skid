'use strict'
var Benchmark = require('benchmark')

var result // to defeat escape analysis

function interlacer(callback) {
    result = 5
    callback()
    result = 3
}

function cachedCallback() {
    result += 1
}


new Benchmark.Suite('Code Interlacing')
.add('interlacer function', function() {
    interlacer(function() { result += 1 })
})
.add('interlacer function without callback construction', function() {
    interlacer(cachedCallback)
})
.add('manual inlining - just interlacer', function() {
    result = 5
    cachedCallback()
    result = 3
})
.add('manual inlining - everything', function() {
    result = 5
    result += 1
    result = 3
})
.on('cycle', function(event) {
    console.log(String(event.target))
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run()
