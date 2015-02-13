'use strict'

var Interpolands = require('../interpolands')
var DefaultAvatar = require('../default-avatar')
var Viewport = require('../viewport')


describe('Avatar', function() {
    var avatars
    var context
    beforeEach(function() {
        context = {}
        var canvas = {
            getContext: function() {
                return context
            }
        }
        avatars = new Viewport(canvas)
    })
    
    it('does not sort new avatars', function() {
        var a = new DefaultAvatar(avatars)
        expect(a.layer).toBe(undefined)
        
        a.layer = 10
        expect(a.layer).toBe(10)
        
        var b = new DefaultAvatar(avatars)
        expect(b.layer).toBe(undefined)
        expect(a.layer).toBe(10)
        expect(avatars.alive.toArray()[0]).toBe(a)
        expect(avatars.alive.toArray()[1]).toBe(b)
    })
    
    it('sorts avatars ascendingly', function() {
        var a = new DefaultAvatar(avatars)
        a.layer = 10
        
        var b = new DefaultAvatar(avatars)
        b.layer = 2
        
        expect(avatars.alive.toArray()[0]).toBe(b)
        expect(avatars.alive.toArray()[1]).toBe(a)
        expect(avatars.alive.size).toBe(2)
        
        b.layer = 11
        expect(avatars.alive.toArray()[0]).toBe(a)
        expect(avatars.alive.toArray()[1]).toBe(b)
        expect(avatars.alive.size).toBe(2)
    })
    
    it('sorts past avatars of undefined layer', function() {
        var a = new DefaultAvatar(avatars)
        a.layer = 9
        var b = new DefaultAvatar(avatars)
        var c = new DefaultAvatar(avatars)
        expect(avatars.alive.toArray()[0]).toBe(a)
        expect(avatars.alive.toArray()[1]).toBe(b)
        expect(avatars.alive.toArray()[2]).toBe(c)
        
        c.layer = 7
        expect(avatars.alive.toArray()[0]).toBe(c)
        expect(avatars.alive.toArray()[1]).toBe(a)
        expect(avatars.alive.toArray()[2]).toBe(b)
    })
    
    it('sorts many avatars', function() {
        var a = new DefaultAvatar(avatars)
        a.layer = 1.001
        var b = new DefaultAvatar(avatars)
        b.layer = 999
        var c = new DefaultAvatar(avatars)
        c.layer = 1.001
        var d = new DefaultAvatar(avatars)
        d.layer = 1
        var e = new DefaultAvatar(avatars)
        e.layer = 5
        var f = new DefaultAvatar(avatars)
        f.layer = -2
        var g = new DefaultAvatar(avatars)
        g.layer = -2.1
        var h = new DefaultAvatar(avatars)
        var i = new DefaultAvatar(avatars)
        i.layer = -1
        h.layer = 4

        expect(avatars.alive.toArray()[0]).toBe(g)
        expect(avatars.alive.toArray()[1]).toBe(f)
        expect(avatars.alive.toArray()[2]).toBe(i)
        expect(avatars.alive.toArray()[3]).toBe(d)
        expect(avatars.alive.toArray()[4]).toBe(a)
        expect(avatars.alive.toArray()[5]).toBe(c)
        expect(avatars.alive.toArray()[6]).toBe(h)
        expect(avatars.alive.toArray()[7]).toBe(e)
        expect(avatars.alive.toArray()[8]).toBe(b)
        
        a.layer = 4
        b.layer = 7
        c.layer = -.01
        d.layer = -1
        e.layer = 3.999
        f.layer = 3.9999999
        g.layer = 8
        h.layer = 0
        i.layer = 4

        expect(avatars.alive.toArray()[0]).toBe(d)
        expect(avatars.alive.toArray()[1]).toBe(c)
        expect(avatars.alive.toArray()[2]).toBe(h)
        expect(avatars.alive.toArray()[3]).toBe(e)
        expect(avatars.alive.toArray()[4]).toBe(f)
        expect(avatars.alive.toArray()[5]).toBe(i)
        expect(avatars.alive.toArray()[6]).toBe(a)
        expect(avatars.alive.toArray()[7]).toBe(b)
        expect(avatars.alive.toArray()[8]).toBe(g)
    })
    
    it('draws all avatars in order', function() {
        var i = 0
        
        var a = new DefaultAvatar(avatars)
        a.layer = 4
        var b = new DefaultAvatar(avatars)
        b.layer = 3
        a.draw = jasmine.createSpy('drawA').and.callFake(function(contextArg) {
            expect(contextArg).toBe(context)
            expect(i).toBe(1)
            i += 1
        })
        b.draw = jasmine.createSpy('drawB').and.callFake(function(contextArg) {
            expect(contextArg).toBe(context)
            expect(i).toBe(0)
            i += 1
        })
        
        expect(avatars.alive.toArray()[0]).toBe(b)
        expect(avatars.alive.toArray()[1]).toBe(a)
        
        avatars.draw(context)
        expect(a.draw).toHaveBeenCalled()
        expect(b.draw).toHaveBeenCalled()
    })
    
    it('leaves no interpolands behind after removal', function() {
        new DefaultAvatar(avatars).remove()
        avatars.interpolands.update(0)
        expect(avatars.alive.size).toBe(0)
        expect(avatars.interpolands.aliveCount).toBe(0)
    })
    
    it('leaves no interpolands behind after multi-removal and calls all onRemoves', function() {
        var a = new DefaultAvatar(avatars)
        var b = new DefaultAvatar(avatars)
        var c = new DefaultAvatar(avatars)
        
        a.remove()
        b.remove()
        c.remove()
        avatars.interpolands.update(0)
        expect(avatars.alive.size).toBe(0)
        expect(avatars.interpolands.aliveCount).toBe(0)
    })
    
    it('handles multiple creations and removals', function() {
        var a = new DefaultAvatar(avatars)
        var b = new DefaultAvatar(avatars)
        var c = new DefaultAvatar(avatars)
        var d = new DefaultAvatar(avatars)
        var e = new DefaultAvatar(avatars)
        
        expect(avatars.alive.size).toBe(5)
        expect(avatars.interpolands.aliveCount).toBe(30)
        
        d.remove()
        avatars.interpolands.update(0)
        expect(avatars.alive.toArray()[0]).toBe(a)
        expect(avatars.alive.toArray()[1]).toBe(b)
        expect(avatars.alive.toArray()[2]).toBe(c)
        expect(avatars.alive.toArray()[3]).toBe(e)
        
        expect(avatars.alive.size).toBe(4)
        expect(avatars.interpolands.aliveCount).toBe(24)
        expect(avatars.interpolands.deadCount).toBe(6)
        
        var dx = d
        d = new DefaultAvatar(avatars)
        expect(d).not.toBe(dx)
        expect(avatars.alive.toArray()[3]).toBe(e)
        expect(avatars.alive.toArray()[4]).toBe(d)
        
        a.remove()
        avatars.interpolands.update(0)
        expect(avatars.alive.size).toBe(4)
        expect(avatars.interpolands.aliveCount).toBe(24)
        expect(avatars.interpolands.deadCount).toBe(6)
        expect(avatars.alive.toArray()[0]).toBe(b)
        expect(avatars.alive.toArray()[1]).toBe(c)
        expect(avatars.alive.toArray()[2]).toBe(e)
        expect(avatars.alive.toArray()[3]).toBe(d)
        
        var ax = a
        a = new DefaultAvatar(avatars)
        expect(a).not.toBe(ax)
        expect(avatars.alive.size).toBe(5)
        expect(avatars.interpolands.aliveCount).toBe(30)
        expect(avatars.interpolands.deadCount).toBe(0)
        expect(avatars.alive.toArray()[4]).toBe(a)
        
        c.remove()
        b.remove()
        e.remove()
        avatars.interpolands.update(0)
        expect(avatars.alive.size).toBe(2)
        expect(avatars.interpolands.aliveCount).toBe(12)
        expect(avatars.interpolands.deadCount).toBe(18)
        expect(avatars.alive.toArray()[0]).toBe(d)
        expect(avatars.alive.toArray()[1]).toBe(a)
        
        e = new DefaultAvatar(avatars)
        b = new DefaultAvatar(avatars)
        c = new DefaultAvatar(avatars)
        
        var f = new DefaultAvatar(avatars)
        expect(avatars.alive.size).toBe(6)
        expect(avatars.interpolands.aliveCount).toBe(36)
        expect(avatars.interpolands.deadCount).toBe(0)
        expect(avatars.alive.toArray()[0]).toBe(d)
        expect(avatars.alive.toArray()[1]).toBe(a)
        expect(avatars.alive.toArray()[2]).toBe(e)
        expect(avatars.alive.toArray()[3]).toBe(b)
        expect(avatars.alive.toArray()[4]).toBe(c)
        expect(avatars.alive.toArray()[5]).toBe(f)
    })
    
})
