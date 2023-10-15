import {TileField} from './tilefield'
import {IconAvatar} from './iconavatar'
import {is} from '../is'

export class ComputedTileField {
    constructor(root, tileSize) {
        this.field = new TileField(root, tileSize)
        this.avatars = Object.create(null) // {position: {[type]: [avatar, ...]}}
    }

    _hasTypeAtKey(key, types) {
        const map = this.avatars[key]
        if(!map)
            return false
        if(is.iterable(types)) {
            for(const type of types) {
                if(map[type] && map[type].length)
                    return true
            }
        } else {
            if(map[types] && map[types].length)
                return true
        }
        return false
    }

    _addAvatar(x, y, type, avatar) {
        const key = keyOf(x, y)
        let map = this.avatars[key]
        if(!map) {
            map = Object.create(null)
            this.avatars[key] = map
        }
        let list = map[type]
        if(!list) {
            list = []
            map[type] = list
        }
        list.push(avatar)
    }

    _changedAt(x, y) {
        const key = keyOf(x, y)
        const lists = this.avatars[key]
        for(const type in lists) {
            const list = lists[type]
            for(const avatar of list) {
                if(avatar.updater) {
                    avatar.icon = avatar.updater(this, x, y)
                }
            }
        }
        const node = this.field._segments[key]
        if (node) {
            node._altered = true
        }
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

    _makeTile4Part(icon, x, y, layer, type, sx, sy) {
        const segment = this.field.nodeAt(x, y)
        const avatar = new IconAvatar(segment, undefined, x + .25 * sx, y + .25 * sy, .5, .5)
        avatar.layer = layer
        if(is.function(icon))
            avatar.updater = icon
        else
            avatar.icon = icon
        this._addAvatar(x, y, type, avatar)
    }

    makeTile4({nw, ne, sw, se}, x, y, layer, type) {
        this._makeTile4Part(sw, x, y, layer, type, -1, 1)
        this._makeTile4Part(se, x, y, layer, type, 1, 1)
        this._makeTile4Part(nw, x, y, layer, type, -1, -1)
        this._makeTile4Part(ne, x, y, layer, type, 1, -1)
        this._changedAt(x, y)
        this._changedAround(x, y)
    }

    makeTile(icon, x, y, layer, type) {
        const avatar = new IconAvatar(this.field.nodeAt(x, y), icon, x, y, 1, 1)
        avatar.layer = layer
        this._addAvatar(x, y, type, avatar)
        this._changedAround(x, y)
    }

    hasTile(type, x, y) {
        const lists = this.avatars[keyOf(x, y)]
        return lists && lists[type] && lists[type].length > 0
    }

    insertAvatar(avatar, x, y, type) {
        this.field.nodeAt(x, y).insert(avatar)
        this._addAvatar(x, y, type, avatar)
        this._changedAround(x, y)
    }

    removeTile(x, y, type) {
        const lists = this.avatars[keyOf(x, y)]
        if(lists && lists[type]) {
            for(const avatar of lists[type]) {
                avatar.remove()
            }
            delete lists[type]
            this._changedAt(x, y)
            this._changedAround(x, y)
        }
    }

    clear() {
        this.field.clear()
        this.avatars = Object.create(null)
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

        return select(convex, concave, hFace, vFace, surrounded, corner, horiz, vert)
    }
}

function select(convex, concave, hFace, vFace, surrounded, atCorner, atHFace, atVFace) {
    return (atCorner && atHFace && atVFace)? surrounded:
           (atHFace && atVFace)? concave:
           atVFace? hFace:
           atHFace? vFace:
           convex
}
