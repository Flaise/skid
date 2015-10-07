import LinkedList from '../linked-list'
import Avatar from './avatar'
import Interpolands from '../interpolands'

export default class Group extends Avatar {
    constructor(container) {
        super(container)
        if(container)
            this.interpolands = container.interpolands // used when adding avatars to this group
        else
            this.interpolands = new Interpolands()
        this.alive = new LinkedList()
    }
    
    walk(callback) {
        callback(this)
        this.walkContents(callback)
    }
    
    walkContents(callback) {
        this.alive.forEach(avatar => avatar.walk(callback))
    }
    
    draw(context) {
        this.alive.forEach(avatar => avatar.draw(context))
    }
    
    subremove() {
        this.alive.forEach(avatar => avatar.remove())
    }
    
    get empty() {
        return this.alive.empty
    }
}
