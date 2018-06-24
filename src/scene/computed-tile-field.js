import {TileField} from './tile-field'
import {IconAvatar} from './icon-avatar'
import {is} from '../is'

export class ComputedTileField {
    constructor(root, tileSize) {
        this.field = new TileField(root, tileSize)
        this.types = Object.create(null) // {position: {[type]: true}}
        this.updaters = Object.create(null)
    }

    _hasTypeAtKey(key, types) {
        const typeSet = this.types[key]
        if(!typeSet)
            return false
        if(!is.iterable(types))
            return !!typeSet[types]
        for(const type of types)
            if(typeSet[type])
                return true
        return false
    }

    _addType(x, y, type) {
        const key = keyOf(x, y)
        let typeSet = this.types[key]
        if(!typeSet) {
            typeSet = Object.create(null)
            this.types[key] = typeSet
        }
        typeSet[type] = true
    }

    _removeType(x, y, type) {
        const key = keyOf(x, y)
        const typeSet = this.types[key]
        if(typeSet)
            delete typeSet[type]
    }

    _addUpdater(x, y, func) {
        const key = keyOf(x, y)
        let updaters = this.updaters[key]
        if(!updaters) {
            updaters = []
            this.updaters[key] = updaters
        }

        updaters.push(func)
    }

    _changedAt(x, y) {
        const functions = this.updaters[keyOf(x, y)]
        if(functions)
            for(const func of functions)
                func(this, x, y)
    }

    _changedAround(x, y) {
        this._changedAt(x - 1, y - 1)
        this._changedAt(x, y - 1)
        this._changedAt(x + 1, y - 1)
        this._changedAt(x - 1, y)
        this._changedAt(x + 1, y)
        this._changedAt(x - 1, y + 1)
        this._changedAt(x, y + 1)
        this._changedAt(x + 1, y + 1)
    }

    _makeTile4Part(icon, x, y, layer, sx, sy) {
        const segment = this.field.nodeAt(x, y)
        const avatar = new IconAvatar(segment, undefined, x + .25 * sx, y + .25 * sy, .5, .5)
        avatar.layer = layer
        if(is.function(icon))
            this._addUpdater(x, y, icon(avatar))
        else
            avatar.icon = icon
    }

    makeTile4({nw, ne, sw, se}, x, y, layer, type) {
        this._makeTile4Part(sw, x, y, layer, -1, 1)
        this._makeTile4Part(se, x, y, layer, 1, 1)
        this._makeTile4Part(nw, x, y, layer, -1, -1)
        this._makeTile4Part(ne, x, y, layer, 1, -1)

        this._addType(x, y, type)
        this._changedAt(x, y)
        this._changedAround(x, y)
    }
    makeTile(icon, x, y, layer, type) {
        const avatar = new IconAvatar(this.field.nodeAt(x, y), icon, x, y, 1, 1)
        avatar.layer = layer
        this._addType(x, y, type)
        this._changedAround(x, y)
        return {
            remove: () => {
                avatar.remove()
                this._removeType(x, y, type)
                this._changedAround(x, y)
            }
        }
    }

    clear() {
        this.field.clear()
        this.types = Object.create(null)
        this.updaters = Object.create(null)
    }
}

function keyOf(x, y) {
    return x + ',' + y
}

export function borderIcons(
    observedTypes, inverse,
    nw, n, ne,
    w,  c,  e,
    sw, s, se,
    concaveNW, concaveNE,
    concaveSW, concaveSE
) {
    return {
        nw: selected(-1, -1, observedTypes, inverse, nw, concaveSE, n, w, c),
        ne: selected(1, -1, observedTypes, inverse, ne, concaveSW, n, e, c),
        sw: selected(-1, 1, observedTypes, inverse, sw, concaveNE, s, w, c),
        se: selected(1, 1, observedTypes, inverse, se, concaveNW, s, e, c)
    }
}

function selected(dx, dy, observedTypes, inverse, convex, concave, hFace, vFace, surrounded) {
    return (avatar) => {
        return (cfield, x, y) => {
            const cornerKey = keyOf(x + dx, y + dy)
            const hKey = keyOf(x, y + dy)
            const vKey = keyOf(x + dx, y)

            let corner = cfield._hasTypeAtKey(cornerKey, observedTypes)
            let horiz = cfield._hasTypeAtKey(hKey, observedTypes)
            let vert = cfield._hasTypeAtKey(vKey, observedTypes)

            if(inverse) {
                corner = !corner
                horiz = !horiz
                vert = !vert
            }

            avatar.icon = select(convex, concave, hFace, vFace, surrounded, corner, horiz, vert)
        }
    }
}

function select(convex, concave, hFace, vFace, surrounded, atCorner, atHFace, atVFace) {
    return (atCorner && atHFace && atVFace)? surrounded:
           (atHFace && atVFace)? concave:
           atVFace? hFace:
           atHFace? vFace:
           convex
}
