import LinkedList from '../linked-list'
import Avatar from './avatar'

export default class Group extends Avatar {
    constructor(avatars) {
        super(avatars)
        this.interpolands = avatars.interpolands // used when adding avatars to this group
        this.alive = new LinkedList()
    }
    
    draw(context) {
        this.alive.forEach(avatar => avatar.draw(context))
    }
    
    remove() {
        if(this.removed)
            return
        this.alive.forEach(avatar => avatar.remove())
        super.remove()
    }
}
