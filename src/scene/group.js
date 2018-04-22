import {Avatar} from './avatar'
import {Interpolands} from '../interpolands'

export class Group extends Avatar {
    constructor(container) {
        super(container)
        if(container)
            this.interpolands = container.interpolands // used when adding avatars to this group
        else
            this.interpolands = new Interpolands(this)
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
}
