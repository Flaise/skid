'use strict'
var Benchmark = require('benchmark')

var arrA = [2, 9]
var arrB = [1, -2]

var objA = {x: 2, y: 9}
var objB = {x: 1, y: -2}

var objArrA = {'0': 2, '1': 9}
var objArrB = {'0': 1, '1': -2}

var outArr = [0, 0]
var outObj = {x: 0, y: 0}

var c // to defeat escape analysis

new Benchmark.Suite('Vector Math')
.add('array addition', function() {
    c = [arrA[0] + arrB[0], arrA[1] + arrB[1]]
})
.add('object addition (literal)', function() {
    c = {x: objA.x + objB.x, y: objA.y + objB.y}
})
.add('object addition (property creation)', function() {
    c = {}
    c.x = objA.x + objB.x
    c.y = objA.y + objB.y
})
.add('object addition (property assignment)', function() {
    c = {x: 0, y: 0}
    c.x = objA.x + objB.x
    c.y = objA.y + objB.y
})
.add('object pretending to be array addition', function() {
    c = {'0': objArrA[0] + objArrB[0], '1': objArrA[1] + objArrB[1]}
})
.add('array addition with out parameter', function() {
    outArr[0] = arrA[0] + arrB[0]
    outArr[1] = arrA[1] + arrB[1]
})
.add('object addition with out parameter', function() {
    outObj.x = objA.x + objB.x
    outObj.y = objA.y + objB.y
})
.on('cycle', function(event) {
    console.log(String(event.target))
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run()
