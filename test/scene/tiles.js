import assert from 'power-assert'
import {ComputedTileField} from '../../src/scene/computed-tile-field'

suite('tiles')

test('clear', () => {
    const field = new ComputedTileField(undefined, 100)
    field.makeTile(undefined, 0, 0, 0, 0)
    field.makeTile(undefined, 0, 1, 0, 0)
    assert(Object.keys(field.field._segments).length === 2)

    const segments = Object.keys(field.field._segments).map(key => field.field._segments[key])

    field.clear()
    assert(Object.keys(field.field._segments).length === 0)
    assert(Object.keys(field.types).length === 0)
    assert(Object.keys(field.updaters).length === 0)

    for(const segment of segments)
        assert(segment.contents == undefined)
})
