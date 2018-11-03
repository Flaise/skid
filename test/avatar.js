import assert from 'power-assert'
import sinon from 'sinon'
import {Interpolands} from '../src/interpolands'
import {Translation} from '../src/scene/translation'
import {Viewport} from '../src/scene/viewport'

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
    sinon.stub(avatars, 'changed')
})

test('does not sort new avatars', function() {
    var a = new Translation(avatars)
    assert(a.layer === undefined)

    a.layer = 10
    assert(a.layer === 10)

    var b = new Translation(avatars)
    assert(b.layer === undefined)
    assert(a.layer === 10)
    assert(avatars.contents[0] === a)
    assert(avatars.contents[1] === b)

    // yield browser.url('http://www.google.com')
    // assert((yield browser.getTitle()) === 'Google')
})

test('sorts avatars ascendingly', function() {
    var a = new Translation(avatars)
    a.layer = 10

    var b = new Translation(avatars)
    b.layer = 2

    assert(avatars.contents[0] === b)
    assert(avatars.contents[1] === a)
    assert(avatars.contents.length === 2)

    b.layer = 11
    assert(avatars.contents[0] === a)
    assert(avatars.contents[1] === b)
    assert(avatars.contents.length === 2)
})

test('sorts past avatars of undefined layer', function() {
    var a = new Translation(avatars)
    a.layer = 9
    var b = new Translation(avatars)
    var c = new Translation(avatars)
    assert(avatars.contents[0] === a)
    assert(avatars.contents[1] === b)
    assert(avatars.contents[2] === c)

    c.layer = 7
    assert(avatars.contents[0] === c)
    assert(avatars.contents[1] === a)
    assert(avatars.contents[2] === b)
})

test('sorts many avatars', function() {
    var a = new Translation(avatars)
    a.layer = 1.001
    var b = new Translation(avatars)
    b.layer = 999
    var c = new Translation(avatars)
    c.layer = 1.001
    var d = new Translation(avatars)
    d.layer = 1
    var e = new Translation(avatars)
    e.layer = 5
    var f = new Translation(avatars)
    f.layer = -2
    var g = new Translation(avatars)
    g.layer = -2.1
    var h = new Translation(avatars)
    var i = new Translation(avatars)
    i.layer = -1
    h.layer = 4

    assert(avatars.contents[0] === g)
    assert(avatars.contents[1] === f)
    assert(avatars.contents[2] === i)
    assert(avatars.contents[3] === d)
    assert(avatars.contents[4] === a || avatars.contents[4] === c)
    assert(avatars.contents[5] === c || avatars.contents[5] === a)
    assert(avatars.contents[6] === h)
    assert(avatars.contents[7] === e)
    assert(avatars.contents[8] === b)

    a.layer = 4
    b.layer = 7
    c.layer = -.01
    d.layer = -1
    e.layer = 3.999
    f.layer = 3.9999999
    g.layer = 8
    h.layer = 0
    i.layer = 4

    assert(avatars.contents[0] === d)
    assert(avatars.contents[1] === c)
    assert(avatars.contents[2] === h)
    assert(avatars.contents[3] === e)
    assert(avatars.contents[4] === f)
    assert(avatars.contents[5] === i)
    assert(avatars.contents[6] === a)
    assert(avatars.contents[7] === b)
    assert(avatars.contents[8] === g)
})

test('draws all avatars in order', function() {
    var i = 0

    var a = new Translation(avatars)
    a.layer = 4
    var b = new Translation(avatars)
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

    assert(avatars.contents[0] === b)
    assert(avatars.contents[1] === a)

    avatars.draw(context)
    assert(a.draw.called)
    assert(b.draw.called)
})

test('leaves no interpolands behind after removal', function() {
    const av = new Translation(avatars)
    av.remove()
    assert(av.removed)
    avatars.interpolands.update(0)
    assert(avatars.contents.length === 0)
    assert(avatars.interpolands.interpolands.length === 0)

    // double-removal should have no effect
    av.remove()
    assert(av.removed)
    avatars.interpolands.update(0)
    assert(avatars.contents.length === 0)
    assert(avatars.interpolands.interpolands.length === 0)
})

test('leaves no interpolands behind after multi-removal and calls all onRemoves', function() {
    var a = new Translation(avatars)
    var b = new Translation(avatars)
    var c = new Translation(avatars)

    assert(avatars.interpolands === a.interpolands)

    a.remove()
    b.remove()
    c.remove()
    avatars.interpolands.update(0)
    assert(avatars.contents.length === 0)
    assert(avatars.interpolands.interpolands.length === 0)
})

test('handles multiple creations and removals', function() {
    var a = new Translation(avatars)
    var b = new Translation(avatars)
    var c = new Translation(avatars)
    var d = new Translation(avatars)
    var e = new Translation(avatars)

    assert(avatars.contents.length === 5)
    assert(avatars.interpolands.interpolands.length === 10)

    d.remove()
    avatars.interpolands.update(0)
    assert(avatars.contents[0] === a)
    assert(avatars.contents[1] === b)
    assert(avatars.contents[2] === c)
    assert(avatars.contents[3] === e)

    assert(avatars.contents.length === 4)
    assert(avatars.interpolands.interpolands.length === 8)

    var dx = d
    d = new Translation(avatars)
    assert(d !== dx)
    assert(avatars.contents[3] === e)
    assert(avatars.contents[4] === d)

    a.remove()
    avatars.interpolands.update(0)
    assert(avatars.contents.length === 4)
    assert(avatars.interpolands.interpolands.length === 8)
    assert(avatars.contents[0] === b)
    assert(avatars.contents[1] === c)
    assert(avatars.contents[2] === e)
    assert(avatars.contents[3] === d)

    var ax = a
    a = new Translation(avatars)
    assert(a !== ax)
    assert(avatars.contents.length === 5)
    assert(avatars.interpolands.interpolands.length === 10)
    assert(avatars.contents[4] === a)

    c.remove()
    b.remove()
    e.remove()
    avatars.interpolands.update(0)
    assert(avatars.contents.length === 2)
    assert(avatars.interpolands.interpolands.length === 4)
    assert(avatars.contents[0] === d)
    assert(avatars.contents[1] === a)

    e = new Translation(avatars)
    b = new Translation(avatars)
    c = new Translation(avatars)

    var f = new Translation(avatars)
    assert(avatars.contents.length === 6)
    assert(avatars.interpolands.interpolands.length === 12)
    assert(avatars.contents[0] === d)
    assert(avatars.contents[1] === a)
    assert(avatars.contents[2] === e)
    assert(avatars.contents[3] === b)
    assert(avatars.contents[4] === c)
    assert(avatars.contents[5] === f)
})
