'use strict'
var Benchmark = require('benchmark')


function Vector(x, y) {
    this.x = x
    this.y = y
}
Vector.prototype.sum = function(other) {
    return new Vector(this.x + other.x, this.y + other.y)
}
Vector.prototype.sumOut = function(other, out) {
    out.x = this.x + other.x
    out.y = this.y + other.y
}
Vector.prototype.sumSelect = function(other, out) {
    if(out) {
        out.x = this.x + other.x
        out.y = this.y + other.y
    }
    else
        return new Vector(this.x + other.x, this.y + other.y)
}


var arrA = [2, 9]
var arrB = [1, -2]

var objA = {x: 2, y: 9}
var objB = {x: 1, y: -2}

var objArrA = {'0': 2, '1': 9}
var objArrB = {'0': 1, '1': -2}

var outArr = [0, 0]
var outObj = {x: 0, y: 0}
var outVec = new Vector()

var c // to defeat escape analysis

var vecA = new Vector(2, 9)
var vecB = new Vector(1, -2)

function staticSumOut(a, b, out) {
    out.x = a.x + b.x
    out.y = a.y + b.y
}


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
.add('class object addition', function() {
    c = vecA.sum(vecB)
})
.add('class object addition with out parameter', function() {
    vecA.sumOut(vecB, outObj)
})
.add('class object addition with class object out parameter', function() {
    vecA.sumOut(vecB, outVec)
})
.add('polymorphic function', function() {
    c = vecA.sumSelect(vecB)
})
.add('polymorphic function with out parameter', function() {
    vecA.sumSelect(vecB, outObj)
})
.add('static function with out parameter', function() {
    staticSumOut(objA, objB, outObj)
})
.add('class objects with static function with out parameter', function() {
    staticSumOut(vecA, vecB, outVec)
})
.on('cycle', function(event) {
    console.log(String(event.target).replace(' x ', '\nx '))
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run()
