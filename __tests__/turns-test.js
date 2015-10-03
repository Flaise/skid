jest.dontMock('../src/turns')
jest.dontMock('../src/vector2')
const turns = require('../src/turns')

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
        expect(turns.wrap(0)).toBe(0)
    })
    
    it('computes the shortest offset', function() {
        expect(turns.shortestOffset(.5, .75)).toBe(.25)
        expect(turns.shortestOffset(.75, .5)).toBe(-.25)
        expect(turns.shortestOffset(0, .875)).toBe(-.125)
        expect(turns.shortestOffset(-.4, 0)).toBeCloseTo(.4)
        expect(turns.shortestOffset(2, 3)).toBe(0)
        expect(turns.shortestOffset(2, 4)).toBe(0)
        expect(turns.shortestOffset(-1, 4)).toBe(0)
        expect(turns.shortestOffset(2, .25)).toBe(.25)
        expect(turns.shortestOffset(9.125, -.125)).toBe(-.25)
        expect(Math.abs(turns.shortestOffset(0, .5))).toBe(.5)
        expect(Math.abs(turns.shortestOffset(.25, -.25))).toBe(.5)
        expect(turns.shortestOffset(.125, -.125)).toBe(-.25)
    })
    
    it('generates a unit vector', () => {
        expect(turns.toVector(turns.NORTH)).toEqual({x: 0, y: -1})
        expect(turns.toVector(turns.EAST)).toEqual({x: 1, y: 0})
        expect(turns.toVector(turns.SOUTH)).toEqual({x: 0, y: 1})
        expect(turns.toVector(turns.WEST)).toEqual({x: -1, y: 0})
        
        let vec = turns.toVector(.125)
        expect(vec.x).toBeCloseTo(Math.sqrt(2) / 2)
        expect(vec.y).toBeCloseTo(Math.sqrt(2) / -2)
    })
    
    it('converts to and from radians', () => {
        expect(turns.fromRadians(turns.toRadians(0))).toBeCloseTo(0)
        expect(turns.fromRadians(turns.toRadians(.1))).toBeCloseTo(.1)
        expect(turns.fromRadians(turns.toRadians(.5))).toBeCloseTo(.5)
        expect(turns.fromRadians(turns.toRadians(-2))).toBeCloseTo(-2)
    })
})
