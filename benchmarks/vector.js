var Benchmark = require('benchmark')

new Benchmark.Suite('Vector Math')
.add('array addition', function() {
    var a = [2, 9]
    var b = [1, -2]
    var c = [a[0] + b[0], a[1] + b[1]]
})
.add('object addition', function() {
    var a = {x: 2, y: 9}
    var b = {x: 1, y: -2}
    var c = {x: a.x + b.x, y: a.y + b.y}
})
.add('object pretending to be array addition', function() {
    var a = {'0': 2, '1': 9}
    var b = {'0': 1, '1': -2}
    var c = {'0': a[0] + b[0], '1': a[1] + b[1]}
})
.on('cycle', function(event) {
    console.log(String(event.target))
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run()
