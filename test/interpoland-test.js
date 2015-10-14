import assert from 'power-assert'
import sinon from 'sinon'
import Interpolands from './interpolands'
import * as tween from './tween'

suite('Interpoland')

let interpolands
let avatar
beforeEach(function() {
    avatar = {changed: sinon.spy()}
    interpolands = new Interpolands(avatar)
    
    assert(interpolands.interpolands.length === 0)
    assert(interpolands.tweens.length === 0)
})

test('calls changed() when modifying interpoland', () => {
    const a = interpolands.make(1)
    a.setTo(2)
    assert(avatar.changed.called)
})

test('does not call changed() when performing no-op assignment', () => {
    const a = interpolands.make(1)
    a.setTo(1)
    assert(avatar.changed.callCount === 0)
})

test('does not call changed() when performing no-op tween', () => {
    const a = interpolands.make(1)
    a.modTo(1, 1, tween.linear)
    assert(avatar.changed.callCount === 0)
})

test('calls changed() when performing no-op tween with onDone trigger', () => {
    const a = interpolands.make(1)
    a.modTo(1, 1, tween.linear, () => {})
    assert(avatar.changed.callCount === 1)
})

test('calls changed() when destroying tweens with no-op assignment', () => {
    const a = interpolands.make(1)
    a.modTo(2, 1, tween.linear)
    a.modTo(1, 1, tween.linear)
    avatar.changed.reset()
    assert(a.dest === 1)
    a.setTo(1)
    assert(a.dest === 1)
    assert(avatar.changed.callCount === 1)
})

test('recycles second of 3', function() {
    var a = interpolands.make(1)
    var b = interpolands.make(2)
    var c = interpolands.make(3)
    assert(interpolands.interpolands.length === 3)
    
    b.remove()
    interpolands.update(0)
    assert(interpolands.interpolands.length === 2)
    
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
    assert(interpolands.interpolands.length === 5)
    
    b.remove()
    c.remove()
    interpolands.update(0)
    assert(interpolands.interpolands.length === 3)
    
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
    assert(interpolands.tweens.length === 1)
    assert(onDone.callCount === 0)
    
    inter.remove()
    interpolands.update(0)
    assert(interpolands.tweens.length === 0)
    
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
    assert(interpolands.interpolands.length === 1)
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
    assert(interpolands.tweens.length === 2)
    
    interpolands.update(1)
    assert(onDoneA.called)
    assert(onDoneB.callCount === 0)
    assert(inter.curr === -1)
    assert(inter.dest === -2)
    assert(interpolands.tweens.length === 1)
    
    onDoneA.reset()
    interpolands.update(1)
    assert(onDoneA.callCount === 0)
    assert(onDoneB.called)
    assert(inter.curr === -2)
    assert(inter.dest === -2)
    assert(interpolands.tweens.length === 0)
})

test('can halt interpolation and snap to a value', function() {
    var onDone = sinon.spy()
    
    var inter = interpolands.make(8)
    inter.mod(2, 1, tween.power_fac(1), onDone)
    assert(interpolands.tweens.length === 1)
    assert(onDone.callCount === 0)
    assert(inter.curr === 8)
    assert(inter.dest === 10)
    
    inter.setTo(5)
    assert(interpolands.tweens.length === 0)
    assert(onDone.callCount === 0)
    assert(inter.curr === 5)
    assert(inter.dest === 5)
})

test('can snap value without halting interpolation', function() {
    var inter = interpolands.make(9)
    inter.mod(5, 1, tween.power_fac(1))
    inter.modNow(1)
    assert(interpolands.tweens.length === 1)
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
    assert(interpolands.tweens.length === 1)
    
    inter.modTo(2, 1, tween.power_fac(1), onDoneB)
    assert(onDoneA.callCount === 0)
    assert(onDoneB.callCount === 0)
    assert(inter.curr === -4)
    assert(inter.dest === 2)
    assert(interpolands.tweens.length === 2)
    
    interpolands.update(.5)
    assert(onDoneA.callCount === 0)
    assert(onDoneB.callCount === 0)
    assert(inter.curr === -1)
    assert(inter.dest === 2)
    assert(interpolands.tweens.length === 2)
    
    interpolands.update(.5)
    assert(onDoneA.called)
    assert(onDoneB.called)
    assert(inter.curr === 2)
    assert(inter.dest === 2)
    assert(interpolands.tweens.length === 0)
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
    assert(interpolands.interpolands.length === 2)
    assert(interpolands.tweens.length === 5)
    
    interA.remove()
    interpolands.update(0)
    assert(interB.dest === 8)
    assert(interpolands.interpolands.length === 1)
    assert(interpolands.tweens.length === 2)
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
    assert(interpolands.tweens.length === 1)
    assert(tweenB.dest === -1)
    assert(tweenB.duration === 50)
    assert(!tweenB.onDone)
    assert(tweenB.func === tween.circle)
})
