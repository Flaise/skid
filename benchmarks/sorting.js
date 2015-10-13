var Benchmark = require('benchmark')
var LinkedList = require('../lib/linked-list')

var makeArray = require('./make-array').make
function makeList() {
    var list = new LinkedList()
    for(var i = 0; i < 1000; i += 1)
        list.addLast(i)
    return list
}

var arrA = makeArray()
var arrB = makeArray()
var listA = makeList()

new Benchmark.Suite('Sorted Insertion')
.add('Array#sort', function() {
    arrA.push(60)
    arrA.sort(function(a, b) { return a - b })
})
.add('Array#splice', function() {
    for(var i = arrB.length - 1; i >= 0; i -= 1) {
        if(arrB[i] <= 60) {
            arrB.splice(i, 0, 60)
            break
        }
    }
})
.add('loop shifting', function() {
    for(var i = arrB.length - 1; i >= 0; i -= 1) {
        if(arrB[i] < 60) {
            arrB[i + 1] = 60
            break
        }
        else {
            arrB[i] = arrB[i - 1]
        }
    }
})
.add('LinkedList bubble', function() {
    var node = listA.getLastNode()
    while(node.value > 60)
        node = node.prev
    node.insertValueAfter(60)
})
.on('cycle', function(event) {
    console.log(String(event.target))
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run()
