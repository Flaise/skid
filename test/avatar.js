import assert from 'power-assert'
import sinon from 'sinon'
import Interpolands from '../src/interpolands'
import DefaultAvatar from '../src/scene/default-avatar'
import Viewport from '../src/scene/viewport'

suite('Avatar')

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
    avatars.changed = () => {} // disable autoredraw
})

test('does not sort new avatars', function() {
    var a = new DefaultAvatar(avatars)
    assert(a.layer === undefined)
    
    a.layer = 10
    assert(a.layer === 10)
    
    var b = new DefaultAvatar(avatars)
    assert(b.layer === undefined)
    assert(a.layer === 10)
    assert(avatars.alive.toArray()[0] === a)
    assert(avatars.alive.toArray()[1] === b)
})

test('sorts avatars ascendingly', function() {
    var a = new DefaultAvatar(avatars)
    a.layer = 10
    
    var b = new DefaultAvatar(avatars)
    b.layer = 2
    
    assert(avatars.alive.toArray()[0] === b)
    assert(avatars.alive.toArray()[1] === a)
    assert(avatars.alive.size === 2)
    
    b.layer = 11
    assert(avatars.alive.toArray()[0] === a)
    assert(avatars.alive.toArray()[1] === b)
    assert(avatars.alive.size === 2)
})

test('sorts past avatars of undefined layer', function() {
    var a = new DefaultAvatar(avatars)
    a.layer = 9
    var b = new DefaultAvatar(avatars)
    var c = new DefaultAvatar(avatars)
    assert(avatars.alive.toArray()[0] === a)
    assert(avatars.alive.toArray()[1] === b)
    assert(avatars.alive.toArray()[2] === c)
    
    c.layer = 7
    assert(avatars.alive.toArray()[0] === c)
    assert(avatars.alive.toArray()[1] === a)
    assert(avatars.alive.toArray()[2] === b)
})

test('sorts many avatars', function() {
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

    assert(avatars.alive.toArray()[0] === g)
    assert(avatars.alive.toArray()[1] === f)
    assert(avatars.alive.toArray()[2] === i)
    assert(avatars.alive.toArray()[3] === d)
    assert(avatars.alive.toArray()[4] === a)
    assert(avatars.alive.toArray()[5] === c)
    assert(avatars.alive.toArray()[6] === h)
    assert(avatars.alive.toArray()[7] === e)
    assert(avatars.alive.toArray()[8] === b)
    
    a.layer = 4
    b.layer = 7
    c.layer = -.01
    d.layer = -1
    e.layer = 3.999
    f.layer = 3.9999999
    g.layer = 8
    h.layer = 0
    i.layer = 4

    assert(avatars.alive.toArray()[0] === d)
    assert(avatars.alive.toArray()[1] === c)
    assert(avatars.alive.toArray()[2] === h)
    assert(avatars.alive.toArray()[3] === e)
    assert(avatars.alive.toArray()[4] === f)
    assert(avatars.alive.toArray()[5] === i)
    assert(avatars.alive.toArray()[6] === a)
    assert(avatars.alive.toArray()[7] === b)
    assert(avatars.alive.toArray()[8] === g)
})

test('draws all avatars in order', function() {
    var i = 0
    
    var a = new DefaultAvatar(avatars)
    a.layer = 4
    var b = new DefaultAvatar(avatars)
    b.layer = 3
    a.draw = sinon.spy(function(contextArg) {
        assert(contextArg === context)
        assert(i === 1)
        i += 1
    })
    b.draw = sinon.spy(function(contextArg) {
        assert(contextArg === context)
        assert(i === 0)
        i += 1
    })
    
    assert(avatars.alive.toArray()[0] === b)
    assert(avatars.alive.toArray()[1] === a)
    
    avatars.draw(context)
    assert(a.draw.called)
    assert(b.draw.called)
})

test('leaves no interpolands behind after removal', function() {
    new DefaultAvatar(avatars).remove()
    avatars.interpolands.update(0)
    assert(avatars.alive.size === 0)
    assert(avatars.interpolands.pool.aliveCount === 0)
})

test('leaves no interpolands behind after multi-removal and calls all onRemoves', function() {
    var a = new DefaultAvatar(avatars)
    var b = new DefaultAvatar(avatars)
    var c = new DefaultAvatar(avatars)
    
    a.remove()
    b.remove()
    c.remove()
    avatars.interpolands.update(0)
    assert(avatars.alive.size === 0)
    assert(avatars.interpolands.pool.aliveCount === 0)
})

test('handles multiple creations and removals', function() {
    var a = new DefaultAvatar(avatars)
    var b = new DefaultAvatar(avatars)
    var c = new DefaultAvatar(avatars)
    var d = new DefaultAvatar(avatars)
    var e = new DefaultAvatar(avatars)
    
    assert(avatars.alive.size === 5)
    assert(avatars.interpolands.pool.aliveCount === 30)
    
    d.remove()
    avatars.interpolands.update(0)
    assert(avatars.alive.toArray()[0] === a)
    assert(avatars.alive.toArray()[1] === b)
    assert(avatars.alive.toArray()[2] === c)
    assert(avatars.alive.toArray()[3] === e)
    
    assert(avatars.alive.size === 4)
    assert(avatars.interpolands.pool.aliveCount === 24)
    assert(avatars.interpolands.pool.deadCount === 6)
    
    var dx = d
    d = new DefaultAvatar(avatars)
    assert(d !== dx)
    assert(avatars.alive.toArray()[3] === e)
    assert(avatars.alive.toArray()[4] === d)
    
    a.remove()
    avatars.interpolands.update(0)
    assert(avatars.alive.size === 4)
    assert(avatars.interpolands.pool.aliveCount === 24)
    assert(avatars.interpolands.pool.deadCount === 6)
    assert(avatars.alive.toArray()[0] === b)
    assert(avatars.alive.toArray()[1] === c)
    assert(avatars.alive.toArray()[2] === e)
    assert(avatars.alive.toArray()[3] === d)
    
    var ax = a
    a = new DefaultAvatar(avatars)
    assert(a !== ax)
    assert(avatars.alive.size === 5)
    assert(avatars.interpolands.pool.aliveCount === 30)
    assert(avatars.interpolands.pool.deadCount === 0)
    assert(avatars.alive.toArray()[4] === a)
    
    c.remove()
    b.remove()
    e.remove()
    avatars.interpolands.update(0)
    assert(avatars.alive.size === 2)
    assert(avatars.interpolands.pool.aliveCount === 12)
    assert(avatars.interpolands.pool.deadCount === 18)
    assert(avatars.alive.toArray()[0] === d)
    assert(avatars.alive.toArray()[1] === a)
    
    e = new DefaultAvatar(avatars)
    b = new DefaultAvatar(avatars)
    c = new DefaultAvatar(avatars)
    
    var f = new DefaultAvatar(avatars)
    assert(avatars.alive.size === 6)
    assert(avatars.interpolands.pool.aliveCount === 36)
    assert(avatars.interpolands.pool.deadCount === 0)
    assert(avatars.alive.toArray()[0] === d)
    assert(avatars.alive.toArray()[1] === a)
    assert(avatars.alive.toArray()[2] === e)
    assert(avatars.alive.toArray()[3] === b)
    assert(avatars.alive.toArray()[4] === c)
    assert(avatars.alive.toArray()[5] === f)
})
