import assert from 'power-assert'
import sinon from 'sinon'
import Interpolands from './interpolands'
import * as tween from './tween'

suite('Interpoland')

let interpolands
beforeEach(function() {
    const avatar = {changed: function() {}}
    interpolands = new Interpolands(avatar)
    
    assert(interpolands.pool.aliveCount === 0)
    assert(interpolands.tweens.aliveCount === 0)
})
// afterEach(function() {
//     assert(!interpolands._iterating)
//     assert(!interpolands.tweens._iterating)
// })
    
test('recycles destroyed interpolands', function() {
    var inter = interpolands.make(0)
    assert(inter.curr === 0)
    assert(interpolands.pool.aliveCount === 1)
    assert(interpolands.pool.deadCount === 0)
    
    inter.remove()
    interpolands.update(0)
    assert(interpolands.pool.aliveCount === 0)
    assert(interpolands.pool.deadCount === 1)
    
    var inter2 = interpolands.make(5)
    assert(inter2 === inter)
    assert(inter2.curr === 5)
    assert(interpolands.pool.aliveCount === 1)
    assert(interpolands.pool.deadCount === 0)
})

test('recycles second of 3', function() {
    var a = interpolands.make(1)
    var b = interpolands.make(2)
    var c = interpolands.make(3)
    assert(interpolands.pool.aliveCount === 3)
    assert(interpolands.pool.deadCount === 0)
    
    b.remove()
    interpolands.update(0)
    assert(interpolands.pool.aliveCount === 2)
    assert(interpolands.pool.deadCount === 1)
    assert(interpolands.pool.alive[0] === a)
    assert(interpolands.pool.alive[1] === c)
    assert(interpolands.pool.dead[0] === b)
    
    assert(a.curr === 1)
    assert(a.dest === 1)
    assert(c.curr === 3)
    assert(c.dest === 3)
})

test('recycles second and third of 5', function() {
    var a = interpolands.make(1)
    var b = interpolands.make(2)
    var c = interpolands.make(3)
    var d = interpolands.make(4)
    var e = interpolands.make(5)
    assert(interpolands.pool.aliveCount === 5)
    assert(interpolands.pool.deadCount === 0)
    
    b.remove()
    c.remove()
    interpolands.update(0)
    assert(interpolands.pool.aliveCount === 3)
    assert(interpolands.pool.deadCount === 2)
    assert(interpolands.pool.alive[0] === a)
    assert(interpolands.pool.alive[1] === d)
    assert(interpolands.pool.alive[2] === e)
    assert(interpolands.pool.dead[0] === b)
    assert(interpolands.pool.dead[1] === c)
    
    assert(a.curr === 1)
    assert(a.dest === 1)
    assert(d.curr === 4)
    assert(d.dest === 4)
    assert(e.curr === 5)
    assert(e.dest === 5)
})

test('recycles tween of destroyed interpolands', function() {
    var onDone = sinon.spy()
    
    var inter = interpolands.make(0)
    inter.mod(2, 1, tween.linear, onDone)
    assert(interpolands.tweens.aliveCount === 1)
    assert(interpolands.tweens.deadCount === 0)
    assert(onDone.callCount === 0)
    
    inter.remove()
    interpolands.update(0)
    assert(interpolands.tweens.aliveCount === 0)
    assert(interpolands.tweens.deadCount === 1)
    
    inter = interpolands.make(9)
    var tw = inter.modTo(7, 1, tween.linear)
    assert(tw)
    assert(tw.onDone !== onDone)
    assert(onDone.callCount === 0)
    assert(inter.curr === 9)
    assert(inter.dest === 7)
})

test('interpolates linearly', function() {
    var onDone = sinon.spy()
    
    var val = interpolands.make(1)
    assert(interpolands.pool.aliveCount === 1)
    assert(val.curr === 1)
    
    val.mod(2, 1, tween.power_fac(1), onDone)
    assert(onDone.callCount === 0)
    assert(val.dest === 3)
    interpolands.update(.5)
    assert(onDone.callCount === 0)
    assert(val.curr === 2)
    
    interpolands.update(.5)
    assert(onDone.called)
    assert(val.curr === 3)
    
    onDone.reset()
    interpolands.update(1)
    assert(onDone.callCount === 0)
    assert(val.curr === 3)
})

test('supports concurrent interpolations', function() {
    var onDoneA = sinon.spy()
    var onDoneB = sinon.spy()
    
    var inter = interpolands.make(5)
    inter.mod(-5, 1, tween.power_fac(1), onDoneA)
    assert(onDoneA.callCount === 0)
    assert(inter.curr === 5)
    assert(inter.dest === 0)
    
    inter.mod(-2, 2, tween.power_fac(1), onDoneB)
    assert(onDoneB.callCount === 0)
    assert(inter.curr === 5)
    assert(inter.dest === -2)
    assert(interpolands.tweens.aliveCount === 2)
    assert(interpolands.tweens.deadCount === 0)
    
    interpolands.update(1)
    assert(onDoneA.called)
    assert(onDoneB.callCount === 0)
    assert(inter.curr === -1)
    assert(inter.dest === -2)
    assert(interpolands.tweens.aliveCount === 1)
    assert(interpolands.tweens.deadCount === 1)
    
    onDoneA.reset()
    interpolands.update(1)
    assert(onDoneA.callCount === 0)
    assert(onDoneB.called)
    assert(inter.curr === -2)
    assert(inter.dest === -2)
    assert(interpolands.tweens.aliveCount === 0)
    assert(interpolands.tweens.deadCount === 2)
})

test('can halt interpolation and snap to a value', function() {
    var onDone = sinon.spy()
    
    var inter = interpolands.make(8)
    inter.mod(2, 1, tween.power_fac(1), onDone)
    assert(interpolands.tweens.aliveCount === 1)
    assert(interpolands.tweens.deadCount === 0)
    assert(onDone.callCount === 0)
    assert(inter.curr === 8)
    assert(inter.dest === 10)
    
    inter.setTo(5)
    assert(interpolands.tweens.aliveCount === 0)
    assert(interpolands.tweens.deadCount === 1)
    assert(onDone.callCount === 0)
    assert(inter.curr === 5)
    assert(inter.dest === 5)
})

test('can snap value without halting interpolation', function() {
    var inter = interpolands.make(9)
    inter.mod(5, 1, tween.power_fac(1))
    inter.modNow(1)
    assert(interpolands.tweens.aliveCount === 1)
    assert(inter.curr === 10)
    assert(inter.dest === 15)
    inter.modToNow(-1)
    assert(inter.curr === -6)
    assert(inter.dest === -1)
})

test('interpolates to a destination', function() {
    var onDoneA = sinon.spy()
    var onDoneB = sinon.spy()
    
    var inter = interpolands.make(-4)
    inter.mod(2, 1, tween.power_fac(1), onDoneA)
    assert(onDoneA.callCount === 0)
    assert(inter.curr === -4)
    assert(inter.dest === -2)
    assert(interpolands.tweens.aliveCount === 1)
    
    inter.modTo(2, 1, tween.power_fac(1), onDoneB)
    assert(onDoneA.callCount === 0)
    assert(onDoneB.callCount === 0)
    assert(inter.curr === -4)
    assert(inter.dest === 2)
    assert(interpolands.tweens.aliveCount === 2)
    
    interpolands.update(.5)
    assert(onDoneA.callCount === 0)
    assert(onDoneB.callCount === 0)
    assert(inter.curr === -1)
    assert(inter.dest === 2)
    assert(interpolands.tweens.aliveCount === 2)
    
    interpolands.update(.5)
    assert(onDoneA.called)
    assert(onDoneB.called)
    assert(inter.curr === 2)
    assert(inter.dest === 2)
    assert(interpolands.tweens.aliveCount === 0)
})

test('maintains precision when chaining interpolations', function() {
    var onDoneB = sinon.spy(function(remainder) {
        assert(remainder === 200)
    })
    var onDoneA = sinon.spy(function(remainder) {
        inter.mod(-1, 1000, tween.linear, onDoneB, remainder)
    })
    
    var inter = interpolands.make(0)
    inter.mod(1, 1000, tween.linear, onDoneA)
    assert(inter.dest === 1)
    
    interpolands.update(100)
    assert(onDoneA.callCount === 0)
    assert(inter.dest === 1)
    
    interpolands.update(1500)
    assert(onDoneA.called)
    onDoneA.reset()
    assert(onDoneB.callCount === 0)
    assert(inter.dest === 0)
    
    interpolands.update(600)
    assert(onDoneA.callCount === 0)
    assert(onDoneB.called)
    assert(inter.curr === 0)
    assert(inter.dest === 0)
})

test('maintains precision when chaining interpolations without remainder parameter', function() {
    var onDoneB = sinon.spy(function(remainder) {
        assert(remainder === 200)
    })
    var onDoneA = sinon.spy(function(remainder) {
        inter.mod(-1, 1000, tween.linear, onDoneB)
    })
    
    var inter = interpolands.make(0)
    inter.mod(1, 1000, tween.linear, onDoneA)
    assert(inter.dest === 1)
    
    interpolands.update(100)
    assert(onDoneA.callCount === 0)
    assert(inter.dest === 1)
    
    interpolands.update(1500)
    assert(onDoneA.called)
    onDoneA.reset()
    assert(onDoneB.callCount === 0)
    assert(inter.dest === 0)
    
    interpolands.update(600)
    assert(onDoneA.callCount === 0)
    assert(onDoneB.called)
    assert(inter.curr === 0)
    assert(inter.dest === 0)
    
    var tweenC = inter.modTo(1, 1000, tween.linear)
    assert(inter.curr === 0)
    assert(inter.dest === 1)
    assert(tweenC.elapsed === 0)
})

test('interpolates with no net change', function() {
    var inter = interpolands.make(5)
    assert(inter.curr === 5)
    assert(inter.dest === 5)
    
    inter.mod_noDelta(2, 1000, function(x) { return Math.sin(x * Math.PI * 2) })
    assert(inter.curr === 5)
    assert(inter.dest === 5)
    
    interpolands.update(250)
    assert(inter.curr === 7)
    assert(inter.dest === 5)
    
    interpolands.update(250)
    assert(inter.curr === 5)
    assert(inter.dest === 5)
    
    interpolands.update(250)
    assert(inter.curr === 3)
    assert(inter.dest === 5)
    
    interpolands.update(250)
    assert(inter.curr === 5)
    assert(inter.dest === 5)
    assert(interpolands.tweens.deadCount === 1)
    
    interpolands.update(100)
    assert(inter.curr === 5)
    assert(inter.dest === 5)
})

test('removes one interpoland without disturbing tweens of others', function() {
    var interA = interpolands.make(5)
    var ta = interA.mod(-1, 1, tween.linear)
    var tb = interA.mod(4, 4, tween.linear)
    var interB = interpolands.make(3)
    var tc = interB.mod(2, 2, tween.linear)
    var td = interA.mod(-5, 5, tween.linear)
    var te = interB.mod(3, 3, tween.linear)
    
    assert(interA.dest === 3)
    assert(interB.dest === 8)
    assert(interpolands.pool.aliveCount === 2)
    assert(interpolands.pool.alive[0] === interA)
    assert(interpolands.pool.alive[1] === interB)
    assert(interpolands.tweens.aliveCount === 5)
    assert(interpolands.tweens.alive[0] === ta)
    assert(interpolands.tweens.alive[1] === tb)
    assert(interpolands.tweens.alive[2] === tc)
    assert(interpolands.tweens.alive[3] === td)
    assert(interpolands.tweens.alive[4] === te)
    
    interA.remove()
    interpolands.update(0)
    assert(interB.dest === 8)
    assert(interpolands.pool.aliveCount === 1)
    assert(interpolands.pool.alive[0] === interB)
    assert(interpolands.pool.dead[0] === interA)
    assert(interpolands.tweens.aliveCount === 2)
    assert(interpolands.tweens.dead[0] === ta)
    assert(interpolands.tweens.dead[1] === tb)
    assert(interpolands.tweens.dead[2] === td)
    assert(interpolands.tweens.alive[0] === tc)
    assert(interpolands.tweens.alive[1] === te)
})

test('handles multiple creations and removals', function() {
    var a = interpolands.make(1)
    var b = interpolands.make(2)
    var c = interpolands.make(3)
    var d = interpolands.make(4)
    var e = interpolands.make(5)
    
    d.remove()
    interpolands.update(0)
    assert(interpolands.pool.aliveCount === 4)
    assert(interpolands.pool.dead[0] === d)
    
    assert(interpolands.make(6) === d)
    assert(interpolands.pool.alive[3] === e)
    assert(interpolands.pool.alive[4] === d)
    assert(d.curr === 6)
    
    a.remove()
    interpolands.update(0)
    assert(interpolands.pool.aliveCount === 4)
    assert(interpolands.pool.alive[0] === b)
    assert(interpolands.pool.alive[1] === c)
    assert(interpolands.pool.alive[2] === e)
    assert(interpolands.pool.alive[3] === d)
    assert(interpolands.pool.dead[0] === a)
    
    assert(interpolands.make(7) === a)
    assert(interpolands.pool.aliveCount === 5)
    assert(interpolands.pool.alive[4] === a)
    assert(a.curr === 7)
    
    c.remove()
    interpolands.update(0)
    b.remove()
    interpolands.update(0)
    e.remove()
    interpolands.update(0)
    assert(interpolands.pool.aliveCount === 2)
    assert(interpolands.pool.alive[0] === d)
    assert(interpolands.pool.alive[1] === a)
    assert(interpolands.pool.dead[0] === c)
    assert(interpolands.pool.dead[1] === b)
    assert(interpolands.pool.dead[2] === e)
    
    assert(interpolands.make(8) === e)
    assert(e.curr === 8)
    assert(interpolands.make(9) === b)
    assert(b.curr === 9)
    assert(interpolands.make(10) === c)
    assert(c.curr === 10)
    
    var f = interpolands.make(11)
    assert(interpolands.pool.aliveCount === 6)
    assert(interpolands.pool.alive[0] === d)
    assert(interpolands.pool.alive[1] === a)
    assert(interpolands.pool.alive[2] === e)
    assert(interpolands.pool.alive[3] === b)
    assert(interpolands.pool.alive[4] === c)
    assert(interpolands.pool.alive[5] === f)
})

test('will not reuse an interpoland that is already alive', function() {
    for(var i = 0; i < 30; i += 1)
        interpolands.make(0)
    for(var i = 0; i < interpolands.pool.aliveCount; i += 6)
        interpolands.pool.alive[i].remove()
    interpolands.update(0)
    for(var i = 0; i < 30; i += 1)
        interpolands.make(0)
    interpolands.pool.alive[0].remove()
    interpolands.pool.alive[1].remove()
    interpolands.pool.alive[2].remove()
    interpolands.update(0)
    for(var i = 0; i < 90; i += 1)
        interpolands.make(0)
    for(var i = 0; i < 30; i += 1) {
        interpolands.pool.alive[40].remove()
        interpolands.update(0)
    }
    interpolands.make(0)
    
    for(var i = 0; i < interpolands.pool.aliveCount - 1; i += 1)
        for(var j = i + 1; j < interpolands.pool.aliveCount; j += 1)
            assert(interpolands.pool.alive[i] !== interpolands.pool.alive[j])
})

test('will not update tweens that are added during update', function() {
    var inter = interpolands.make(0)
    var tweenB
    var onDone = sinon.spy((remainder) => {
        assert(remainder === 0)
        tweenB = inter.mod(-1, 50, tween.circle, undefined, remainder)
    })
    var tweenA = inter.mod(1, 100, tween.linear, onDone)
    
    interpolands.update(100)
    assert(onDone.calledOnce)
    assert(inter.curr === 1)
    assert(inter.dest === 0)
    assert(inter.tweens.aliveCount === 1)
    assert(inter.tweens.alive[0] === tweenB)
    assert(tweenB.dest === -1)
    assert(tweenB.duration === 50)
    assert(!tweenB.onDone)
    assert(tweenB.func === tween.circle)
})
