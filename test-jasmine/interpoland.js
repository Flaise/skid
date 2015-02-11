'use strict'

var Interpolands = require('../interpolands')
var tween = require('../tween')


describe('Interpoland', function() {
    var interpolands
    beforeEach(function() {
        interpolands = new Interpolands()
        expect(interpolands.aliveCount).toBe(0)
        expect(interpolands.tweens.aliveCount).toBe(0)
    })
    afterEach(function() {
        expect(interpolands._iterating).toBeFalsy()
        expect(interpolands.tweens._iterating).toBeFalsy()
    })
    
    it('recycles destroyed interpolands', function() {
        var inter = interpolands.make(0)
        expect(inter.curr).toBe(0)
        expect(interpolands.aliveCount).toBe(1)
        expect(interpolands.deadCount).toBe(0)
        
        interpolands.remove([inter])
        expect(interpolands.aliveCount).toBe(0)
        expect(interpolands.deadCount).toBe(1)
        
        var inter2 = interpolands.make(5)
        expect(inter2).toBe(inter)
        expect(inter2.curr).toBe(5)
        expect(interpolands.aliveCount).toBe(1)
        expect(interpolands.deadCount).toBe(0)
    })
    
    it('recycles second of 3', function() {
        var a = interpolands.make(1)
        var b = interpolands.make(2)
        var c = interpolands.make(3)
        expect(interpolands.aliveCount).toBe(3)
        expect(interpolands.deadCount).toBe(0)
        
        interpolands.remove([b])
        expect(interpolands.aliveCount).toBe(2)
        expect(interpolands.deadCount).toBe(1)
        expect(interpolands.alive[0]).toBe(a)
        expect(interpolands.alive[1]).toBe(c)
        expect(interpolands.dead[0]).toBe(b)
        
        expect(a.curr).toBe(1)
        expect(a.dest).toBe(1)
        expect(c.curr).toBe(3)
        expect(c.dest).toBe(3)
    })
    
    it('recycles second and third of 5', function() {
        var a = interpolands.make(1)
        var b = interpolands.make(2)
        var c = interpolands.make(3)
        var d = interpolands.make(4)
        var e = interpolands.make(5)
        expect(interpolands.aliveCount).toBe(5)
        expect(interpolands.deadCount).toBe(0)
        
        interpolands.remove([b, c])
        expect(interpolands.aliveCount).toBe(3)
        expect(interpolands.deadCount).toBe(2)
        expect(interpolands.alive[0]).toBe(a)
        expect(interpolands.alive[1]).toBe(d)
        expect(interpolands.alive[2]).toBe(e)
        expect(interpolands.dead[0]).toBe(b)
        expect(interpolands.dead[1]).toBe(c)
        
        expect(a.curr).toBe(1)
        expect(a.dest).toBe(1)
        expect(d.curr).toBe(4)
        expect(d.dest).toBe(4)
        expect(e.curr).toBe(5)
        expect(e.dest).toBe(5)
    })
    
    it('recycles tween of destroyed interpolands', function() {
        var onDone = jasmine.createSpy()
        
        var inter = interpolands.make(0)
        inter.mod(2, 1, tween.linear, onDone)
        expect(interpolands.tweens.aliveCount).toBe(1)
        expect(interpolands.tweens.deadCount).toBe(0)
        expect(onDone).not.toHaveBeenCalled()
        
        interpolands.remove([inter])
        expect(interpolands.tweens.aliveCount).toBe(0)
        expect(interpolands.tweens.deadCount).toBe(1)
        
        inter = interpolands.make(9)
        var tw = inter.modTo(7, 1, tween.linear)
        expect(tw).toBeDefined()
        expect(tw.onDone).not.toBe(onDone)
        expect(onDone).not.toHaveBeenCalled()
        expect(inter.curr).toBe(9)
        expect(inter.dest).toBe(7)
    })
    
    it('interpolates linearly', function() {
        var onDone = jasmine.createSpy()
        
        var val = interpolands.make(1)
        expect(interpolands.aliveCount).toBe(1)
        expect(val.curr).toBe(1)
        
        val.mod(2, 1, tween.power_fac(1), onDone)
        expect(onDone).not.toHaveBeenCalled()
        expect(val.dest).toBe(3)
        interpolands.update(.5)
        expect(onDone).not.toHaveBeenCalled()
        expect(val.curr).toBe(2)
        
        interpolands.update(.5)
        expect(onDone).toHaveBeenCalled()
        expect(val.curr).toBe(3)
        
        onDone.calls.reset()
        interpolands.update(1)
        expect(onDone).not.toHaveBeenCalled()
        expect(val.curr).toBe(3)
    })
    
    it('supports concurrent interpolations', function() {
        var onDoneA = jasmine.createSpy()
        var onDoneB = jasmine.createSpy()
        
        var inter = interpolands.make(5)
        inter.mod(-5, 1, tween.power_fac(1), onDoneA)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(0)
        
        inter.mod(-2, 2, tween.power_fac(1), onDoneB)
        expect(onDoneB).not.toHaveBeenCalled()
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(-2)
        expect(interpolands.tweens.aliveCount).toBe(2)
        expect(interpolands.tweens.deadCount).toBe(0)
        
        interpolands.update(1)
        expect(onDoneA).toHaveBeenCalled()
        expect(onDoneB).not.toHaveBeenCalled()
        expect(inter.curr).toBe(-1)
        expect(inter.dest).toBe(-2)
        expect(interpolands.tweens.aliveCount).toBe(1)
        expect(interpolands.tweens.deadCount).toBe(1)
        
        onDoneA.calls.reset()
        interpolands.update(1)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(onDoneB).toHaveBeenCalled()
        expect(inter.curr).toBe(-2)
        expect(inter.dest).toBe(-2)
        expect(interpolands.tweens.aliveCount).toBe(0)
        expect(interpolands.tweens.deadCount).toBe(2)
    })
    
    it('can halt interpolation and snap to a value', function() {
        var onDone = jasmine.createSpy()
        
        var inter = interpolands.make(8)
        inter.mod(2, 1, tween.power_fac(1), onDone)
        expect(interpolands.tweens.aliveCount).toBe(1)
        expect(interpolands.tweens.deadCount).toBe(0)
        expect(onDone).not.toHaveBeenCalled()
        expect(inter.curr).toBe(8)
        expect(inter.dest).toBe(10)
        
        inter.setTo(5)
        expect(interpolands.tweens.aliveCount).toBe(0)
        expect(interpolands.tweens.deadCount).toBe(1)
        expect(onDone).not.toHaveBeenCalled()
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(5)
    })
    
    it('can snap value without halting interpolation', function() {
        var inter = interpolands.make(9)
        inter.mod(5, 1, tween.power_fac(1))
        inter.modNow(1)
        expect(interpolands.tweens.aliveCount).toBe(1)
        expect(inter.curr).toBe(10)
        expect(inter.dest).toBe(15)
        inter.modToNow(-1)
        expect(inter.curr).toBe(-6)
        expect(inter.dest).toBe(-1)
    })
    
    it('interpolates to a destination', function() {
        var onDoneA = jasmine.createSpy()
        var onDoneB = jasmine.createSpy()
        
        var inter = interpolands.make(-4)
        inter.mod(2, 1, tween.power_fac(1), onDoneA)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(inter.curr).toBe(-4)
        expect(inter.dest).toBe(-2)
        expect(interpolands.tweens.aliveCount).toBe(1)
        
        inter.modTo(2, 1, tween.power_fac(1), onDoneB)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(onDoneB).not.toHaveBeenCalled()
        expect(inter.curr).toBe(-4)
        expect(inter.dest).toBe(2)
        expect(interpolands.tweens.aliveCount).toBe(2)
        
        interpolands.update(.5)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(onDoneB).not.toHaveBeenCalled()
        expect(inter.curr).toBe(-1)
        expect(inter.dest).toBe(2)
        expect(interpolands.tweens.aliveCount).toBe(2)
        
        interpolands.update(.5)
        expect(onDoneA).toHaveBeenCalled()
        expect(onDoneB).toHaveBeenCalled()
        expect(inter.curr).toBe(2)
        expect(inter.dest).toBe(2)
        expect(interpolands.tweens.aliveCount).toBe(0)
    })
    
    it('precise interpolation chaining', function() {
        var onDoneB = jasmine.createSpy('B').and.callFake(function(remainder) {
            expect(remainder).toBe(200)
        })
        var onDoneA = jasmine.createSpy('A').and.callFake(function(remainder) {
            inter.mod(-1, 1000, tween.linear, onDoneB, remainder)
        })
        
        var inter = interpolands.make(0)
        inter.mod(1, 1000, tween.linear, onDoneA)
        expect(inter.dest).toBe(1)
        
        interpolands.update(100)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(inter.dest).toBe(1)
        
        interpolands.update(1500)
        expect(onDoneA).toHaveBeenCalled()
        onDoneA.calls.reset()
        expect(onDoneB).not.toHaveBeenCalled()
        expect(inter.dest).toBe(0)
        
        interpolands.update(600)
        expect(onDoneA).not.toHaveBeenCalled()
        expect(onDoneB).toHaveBeenCalled()
        expect(inter.curr).toBe(0)
        expect(inter.dest).toBe(0)
    })
    
    it('interpolates with no net change', function() {
        var inter = interpolands.make(5)
        inter.mod_noDelta(2, 1000, function(x) { return Math.sin(x * Math.PI * 2) })
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(5)
        
        interpolands.update(250)
        expect(inter.curr).toBe(7)
        expect(inter.dest).toBe(5)
        
        interpolands.update(250)
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(5)
        
        interpolands.update(250)
        expect(inter.curr).toBe(3)
        expect(inter.dest).toBe(5)
        
        interpolands.update(250)
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(5)
        expect(interpolands.tweens.deadCount).toBe(1)
        
        interpolands.update(100)
        expect(inter.curr).toBe(5)
        expect(inter.dest).toBe(5)
    })
    
    it('removes one interpoland without disturbing tweens of others', function() {
        var interA = interpolands.make(5)
        var ta = interA.mod(-1, 1, tween.linear)
        var tb = interA.mod(4, 4, tween.linear)
        var interB = interpolands.make(3)
        var tc = interB.mod(2, 2, tween.linear)
        var td = interA.mod(-5, 5, tween.linear)
        var te = interB.mod(3, 3, tween.linear)
        
        expect(interA.dest).toBe(3)
        expect(interB.dest).toBe(8)
        expect(interpolands.aliveCount).toBe(2)
        expect(interpolands.alive[0]).toBe(interA)
        expect(interpolands.alive[1]).toBe(interB)
        expect(interpolands.tweens.aliveCount).toBe(5)
        expect(interpolands.tweens.alive[0]).toBe(ta)
        expect(interpolands.tweens.alive[1]).toBe(tb)
        expect(interpolands.tweens.alive[2]).toBe(tc)
        expect(interpolands.tweens.alive[3]).toBe(td)
        expect(interpolands.tweens.alive[4]).toBe(te)
        
        interpolands.remove([interA])
        expect(interB.dest).toBe(8)
        expect(interpolands.aliveCount).toBe(1)
        expect(interpolands.alive[0]).toBe(interB)
        expect(interpolands.dead[0]).toBe(interA)
        expect(interpolands.tweens.aliveCount).toBe(2)
        expect(interpolands.tweens.dead[0]).toBe(ta)
        expect(interpolands.tweens.dead[1]).toBe(tb)
        expect(interpolands.tweens.dead[2]).toBe(td)
        expect(interpolands.tweens.alive[0]).toBe(tc)
        expect(interpolands.tweens.alive[1]).toBe(te)
    })
    
    it('handles multiple creations and removals', function() {
        var a = interpolands.make(1)
        var b = interpolands.make(2)
        var c = interpolands.make(3)
        var d = interpolands.make(4)
        var e = interpolands.make(5)
        
        interpolands.remove([d])
        expect(interpolands.aliveCount).toBe(4)
        expect(interpolands.dead[0]).toBe(d)
        
        expect(interpolands.make(6)).toBe(d)
        expect(interpolands.alive[3]).toBe(e)
        expect(interpolands.alive[4]).toBe(d)
        expect(d.curr).toBe(6)
        
        interpolands.remove([a])
        expect(interpolands.aliveCount).toBe(4)
        expect(interpolands.alive[0]).toBe(b)
        expect(interpolands.alive[1]).toBe(c)
        expect(interpolands.alive[2]).toBe(e)
        expect(interpolands.alive[3]).toBe(d)
        expect(interpolands.dead[0]).toBe(a)
        
        expect(interpolands.make(7)).toBe(a)
        expect(interpolands.aliveCount).toBe(5)
        expect(interpolands.alive[4]).toBe(a)
        expect(a.curr).toBe(7)
        
        interpolands.remove([c])
        interpolands.remove([b])
        interpolands.remove([e])
        expect(interpolands.aliveCount).toBe(2)
        expect(interpolands.alive[0]).toBe(d)
        expect(interpolands.alive[1]).toBe(a)
        expect(interpolands.dead[0]).toBe(c)
        expect(interpolands.dead[1]).toBe(b)
        expect(interpolands.dead[2]).toBe(e)
        
        expect(interpolands.make(8)).toBe(e)
        expect(e.curr).toBe(8)
        expect(interpolands.make(9)).toBe(b)
        expect(b.curr).toBe(9)
        expect(interpolands.make(10)).toBe(c)
        expect(c.curr).toBe(10)
        
        var f = interpolands.make(11)
        expect(interpolands.aliveCount).toBe(6)
        expect(interpolands.alive[0]).toBe(d)
        expect(interpolands.alive[1]).toBe(a)
        expect(interpolands.alive[2]).toBe(e)
        expect(interpolands.alive[3]).toBe(b)
        expect(interpolands.alive[4]).toBe(c)
        expect(interpolands.alive[5]).toBe(f)
    })
    
    it('will not reuse an interpoland that is already alive', function() {
        for(var i = 0; i < 30; i += 1)
            interpolands.make(0)
        for(var i = 0; i < interpolands.aliveCount; i += 6)
            interpolands.remove([interpolands.alive[i]])
        for(var i = 0; i < 30; i += 1)
            interpolands.make(0)
        interpolands.remove([interpolands.alive[0], interpolands.alive[1], interpolands.alive[2]])
        for(var i = 0; i < 90; i += 1)
            interpolands.make(0)
        for(var i = 0; i < 30; i += 1)
            interpolands.remove([interpolands.alive[40]])
        interpolands.make(0)
        
        for(var i = 0; i < interpolands.aliveCount - 1; i += 1)
            for(var j = i + 1; j < interpolands.aliveCount; j += 1)
                expect(interpolands.alive[i]).not.toBe(interpolands.alive[j])
    })
    
    it('will not update tweens that are added during update', function() {
        var inter = interpolands.make(0)
        var tweenB
        var onDone = jasmine.createSpy().and.callFake(function(remainder) {
            expect(remainder).toBe(0)
            tweenB = inter.mod(-1, 50, tween.circle, undefined, remainder)
        })
        var tweenA = inter.mod(1, 100, tween.linear, onDone)
        var tweenC = inter.mod(0, 1000, tween.sine)
        
        interpolands.update(100)
        expect(onDone).toHaveBeenCalled()
        expect(inter.curr).toBe(1)
        expect(inter.dest).toBe(0)
        expect(inter.tweens.aliveCount).toBe(2)
        expect(inter.tweens.alive[1]).toBe(tweenB)
        expect(inter.tweens.alive[0]).toBe(tweenC)
        expect(tweenB.dest).toBe(-1)
        expect(tweenB.duration).toBe(50)
        expect(tweenB.onDone).not.toBeDefined()
        expect(tweenB.func).toBe(tween.circle)
    })
    
})

