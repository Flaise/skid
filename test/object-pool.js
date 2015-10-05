import assert from 'power-assert'
import ObjectPool from '../src/object-pool'

class ObjectWithNumber {
    constructor(num) {
        this.num = num
    }
}


suite('Object Pool')

let pool
beforeEach(function() {
    pool = new ObjectPool(ObjectWithNumber)
    assert(pool.aliveCount === 0)
    assert(pool.deadCount === 0)
})

test('recycles destroyed objects', function() {
    let obj = pool.make(0)
    assert(obj.num === 0)
    assert(pool.aliveCount === 1)
    assert(pool.deadCount === 0)
    
    pool.remove([obj])
    assert(pool.aliveCount === 0)
    assert(pool.deadCount === 1)
    
    let obj2 = pool.make(5)
    assert(obj2.num === 5)
    assert(obj2 === obj)
    assert(pool.aliveCount === 1)
    assert(pool.deadCount === 0)
})

test('recycles second of 3', function() {
    let a = pool.make(1)
    let b = pool.make(2)
    let c = pool.make(3)
    assert(pool.aliveCount === 3)
    assert(pool.deadCount === 0)
    
    pool.remove([b])
    assert(pool.aliveCount === 2)
    assert(pool.deadCount === 1)
    assert(pool.alive[0] === a)
    assert(pool.alive[1] === c)
    assert(pool.dead[0] === b)
    assert(a.num === 1)
    assert(c.num === 3)
})

test('recycles second and third of 5', function() {
    let a = pool.make(1)
    let b = pool.make(2)
    let c = pool.make(3)
    let d = pool.make(4)
    let e = pool.make(5)
    assert(pool.aliveCount === 5)
    assert(pool.deadCount === 0)
    
    pool.remove([b, c])
    assert(pool.aliveCount === 3)
    assert(pool.deadCount === 2)
    assert(pool.alive[0] === a)
    assert(pool.alive[1] === d)
    assert(pool.alive[2] === e)
    assert(pool.dead[0] === b)
    assert(pool.dead[1] === c)
    
    assert(a.num === 1)
    assert(d.num === 4)
    assert(e.num === 5)
})

test('splices around given index', function() {
    let a = pool.make(1)
    let b = pool.make(2)
    let c = pool.make(3)
    assert(pool.aliveCount === 3)
    assert(pool.deadCount === 0)
    
    pool.removeAt(1)
    assert(pool.aliveCount === 2)
    assert(pool.deadCount === 1)
    assert(pool.alive[0] === a)
    assert(pool.alive[1] === c)
    assert(pool.dead[0] === b)
    
    assert(a.num === 1)
    assert(c.num === 3)
})

test('splices around the front of the list', function() {
    let a = pool.make(1)
    let b = pool.make(2)
    let c = pool.make(3)
    assert(pool.aliveCount === 3)
    assert(pool.deadCount === 0)
    
    pool.removeAt(0)
    assert(pool.aliveCount === 2)
    assert(pool.deadCount === 1)
    assert(pool.alive[0] === b)
    assert(pool.alive[1] === c)
    assert(pool.dead[0] === a)
    
    assert(b.num === 2)
    assert(c.num === 3)
})

//    test('iterates over all elements', function() {
//        pool.make(1)
//        pool.make(2)
//        pool.make(3)
//
//        let i = 1
//        for(let it = pool.iterator(); it.hasNext();) {
//            let obj = it.next()
//            assert(i === obj.num)
//            assert(i <= 3 === true)
//            i += 1
//        }
//    })
//
//    test('removes while iterating', function() {
//        pool.make(1)
//        pool.make(2)
//        pool.make(3)
//        pool.make(4)
//        pool.make(5)
//
//        let i = 1
//        for(let it = pool.iterator(); it.hasNext();) {
//            let obj = it.next()
//
//            if(i === 1 || i === 3)
//                it.remove()
//
//            assert(i === obj.num)
//            assert(i <= 5 === true)
//            i += 1
//        }
//
//        let i = 1
//        for(let it = pool.iterator(); it.hasNext();) {
//            let obj = it.next()
//
//            if(i === 1 || i === 3)
//                i += 1
//
//            assert(i === obj.num)
//            assert(i <= 5 === true)
//            i += 1
//        }
//    })
