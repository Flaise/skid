import {Avatar} from './avatar'
import {is} from '../is'
import {insertSorted, remove} from '../array'

function compare(a, b) {
    if(is.nullish(a._layer))
        return -1
    if(is.nullish(b._layer))
        return 1
    return b._layer - a._layer
}

export class Group extends Avatar {
    constructor(container) {
        super(container)
        this.contents = []
    }

    walk(callback) {
        callback(this)
        this.walkContents(callback)
    }

    walkContents(callback) {
        for(let i = 0; i < this.contents.length; i += 1)
            this.contents[i].walk(callback)
    }

    draw(context) {
        for(let i = 0; i < this.contents.length; i += 1)
            this.contents[i].draw(context)
    }

    clear() {
        for(let i = 0; i < this.contents.length; i += 1) {
            this.contents[i].container = undefined
            this.contents[i].remove()
        }
        this.contents.length = 0
    }

    subremove() {
        for(let i = 0; i < this.contents.length; i += 1) {
            this.contents[i].container = undefined
            this.contents[i].remove()
        }
        this.contents = undefined
    }

    get empty() {
        return this.contents.length === 0
    }

    bounds() {
        let first = true
        let left, top, right, bottom
        this.walkContents(avatar => {
            const rect = avatar.bounds()
            if(!rect)
                return

            let [left2, top2, width2, height2] = rect
            let right2 = left2 + width2
            let bottom2 = top2 + height2

            if(first) {
                first = false
                ;[left, top, right, bottom] = [left2, top2, right2, bottom2]
                return
            }

            left = Math.min(left, left2)
            top = Math.min(top, top2)
            right = Math.max(right, right2)
            bottom = Math.max(bottom, bottom2)
        })
        if(first)
            return undefined

        return [left, top, right - left, bottom - top]
    }

    insert(avatar) {
        avatar.container = this
        insertSorted(this.contents, avatar, compare)
    }

    resort(avatar) {
        remove(this.contents, avatar)
        insertSorted(this.contents, avatar, compare)
    }

    removeAvatar(avatar) {
        remove(this.contents, avatar)
    }
}
