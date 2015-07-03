'use strict'

var turns = require('../index').turns


describe('Turns', function() {
    it('wraps angles', function() {
        expect(turns.wrap(1)).toBe(0)
        expect(turns.wrap(.5)).toBe(.5)
        expect(turns.wrap(-.5)).toBe(.5)
        expect(turns.wrap(.25)).toBe(.25)
        expect(turns.wrap(100)).toBe(0)
        expect(turns.wrap(-100)).toBe(0)
        expect(turns.wrap(-.25)).toBe(.75)
        expect(turns.wrap(-1.25)).toBe(.75)
    })
    
    it('computes the shortest offset', function() {
        expect(turns.shortestOffset(.5, .75)).toBe(.25)
        expect(turns.shortestOffset(.75, .5)).toBe(-.25)
        expect(turns.shortestOffset(0, .875)).toBe(-.125)
        expect(turns.shortestOffset(-.4, 0)).toBe(.4)
        expect(turns.shortestOffset(2, 3)).toBe(0)
        expect(turns.shortestOffset(2, .25)).toBe(.25)
        expect(turns.shortestOffset(9.125, -.125)).toBe(-.25)
        expect(Math.abs(turns.shortestOffset(0, .5))).toBe(.5)
        expect(Math.abs(turns.shortestOffset(.25, -.25))).toBe(.5)
    })
})
