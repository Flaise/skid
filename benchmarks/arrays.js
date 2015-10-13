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


new Benchmark.Suite('Filtering')
.add('Array#filter', function() {
    a = a.filter(function(a) { return a % 4 === 0 })
})
.add('Array#splice', function() {
    for(var i = 0; i < b.length; i += 1) {
        if(b[i] % 4 === 0) {
            b.splice(i, 1)
            i -= 1
        }
    }
})
.add('loop', function() {
    var shiftBy = 0
    for(var i = 0; i < c.length; i += 1) {
        if(c[i] % 4 === 0)
            shiftBy += 1
        else
            c[i - shiftBy] = c[i]
    }
    c.length = c.length - shiftBy
})
.on('cycle', function(event) {
    console.log(String(event.target))
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run()



new Benchmark.Suite('Removal')
.add('Array#indexOf', function() {
    var index = e.indexOf(60)
    if(index >= 0)
        e.splice(index, 1)
})
.add('loop', function() {
    var shiftBy = 0
    for(var i = 0; i < f.length; i += 1) {
        if(f[i] === 60)
            shiftBy += 1
        else
            f[i - shiftBy] = f[i]
    }
    f.length = f.length - shiftBy
})
.on('cycle', function(event) {
    console.log(String(event.target))
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run()
