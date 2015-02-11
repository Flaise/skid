'use strict'

var ObjectPool = require('../object-pool')


function ObjectWithNumber(num) {
    this.num = num
}


describe('Object Pool', function() {
    var pool
    beforeEach(function() {
        pool = new ObjectPool(ObjectWithNumber)
        expect(pool.aliveCount).toBe(0)
        expect(pool.deadCount).toBe(0)
    })
    
    it('recycles destroyed objects', function() {
        var obj = pool.make(0)
        expect(obj.num).toBe(0)
        expect(pool.aliveCount).toBe(1)
        expect(pool.deadCount).toBe(0)
        
        pool.remove([obj])
        expect(pool.aliveCount).toBe(0)
        expect(pool.deadCount).toBe(1)
        
        var obj2 = pool.make(5)
        expect(obj2.num).toBe(5)
        expect(obj2).toBe(obj)
        expect(pool.aliveCount).toBe(1)
        expect(pool.deadCount).toBe(0)
    })
    
    it('recycles second of 3', function() {
        var a = pool.make(1)
        var b = pool.make(2)
        var c = pool.make(3)
        expect(pool.aliveCount).toBe(3)
        expect(pool.deadCount).toBe(0)
        
        pool.remove([b])
        expect(pool.aliveCount).toBe(2)
        expect(pool.deadCount).toBe(1)
        expect(pool.alive[0]).toBe(a)
        expect(pool.alive[1]).toBe(c)
        expect(pool.dead[0]).toBe(b)
        expect(a.num).toBe(1)
        expect(c.num).toBe(3)
    })
    
    it('recycles second and third of 5', function() {
        var a = pool.make(1)
        var b = pool.make(2)
        var c = pool.make(3)
        var d = pool.make(4)
        var e = pool.make(5)
        expect(pool.aliveCount).toBe(5)
        expect(pool.deadCount).toBe(0)
        
        pool.remove([b, c])
        expect(pool.aliveCount).toBe(3)
        expect(pool.deadCount).toBe(2)
        expect(pool.alive[0]).toBe(a)
        expect(pool.alive[1]).toBe(d)
        expect(pool.alive[2]).toBe(e)
        expect(pool.dead[0]).toBe(b)
        expect(pool.dead[1]).toBe(c)
        
        expect(a.num).toBe(1)
        expect(d.num).toBe(4)
        expect(e.num).toBe(5)
    })
    
    it('splices around given index', function() {
        var a = pool.make(1)
        var b = pool.make(2)
        var c = pool.make(3)
        expect(pool.aliveCount).toBe(3)
        expect(pool.deadCount).toBe(0)
        
        pool.removeAt(1)
        expect(pool.aliveCount).toBe(2)
        expect(pool.deadCount).toBe(1)
        expect(pool.alive[0]).toBe(a)
        expect(pool.alive[1]).toBe(c)
        expect(pool.dead[0]).toBe(b)
        
        expect(a.num).toBe(1)
        expect(c.num).toBe(3)
    })
    
    it('splices around the front of the list', function() {
        var a = pool.make(1)
        var b = pool.make(2)
        var c = pool.make(3)
        expect(pool.aliveCount).toBe(3)
        expect(pool.deadCount).toBe(0)
        
        pool.removeAt(0)
        expect(pool.aliveCount).toBe(2)
        expect(pool.deadCount).toBe(1)
        expect(pool.alive[0]).toBe(b)
        expect(pool.alive[1]).toBe(c)
        expect(pool.dead[0]).toBe(a)
        
        expect(b.num).toBe(2)
        expect(c.num).toBe(3)
    })
    
//    it('iterates over all elements', function() {
//        pool.make(1)
//        pool.make(2)
//        pool.make(3)
//        
//        var i = 1
//        for(var it = pool.iterator(); it.hasNext();) {
//            var obj = it.next()
//            expect(i).toBe(obj.num)
//            expect(i <= 3).toBe(true)
//            i += 1
//        }
//    })
//    
//    it('removes while iterating', function() {
//        pool.make(1)
//        pool.make(2)
//        pool.make(3)
//        pool.make(4)
//        pool.make(5)
//        
//        var i = 1
//        for(var it = pool.iterator(); it.hasNext();) {
//            var obj = it.next()
//            
//            if(i === 1 || i === 3)
//                it.remove()
//            
//            expect(i).toBe(obj.num)
//            expect(i <= 5).toBe(true)
//            i += 1
//        }
//
//        var i = 1
//        for(var it = pool.iterator(); it.hasNext();) {
//            var obj = it.next()
//            
//            if(i === 1 || i === 3)
//                i += 1
//            
//            expect(i).toBe(obj.num)
//            expect(i <= 5).toBe(true)
//            i += 1
//        }
//    })
    
    
})
