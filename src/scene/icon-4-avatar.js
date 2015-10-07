import Group from './group'
import IconAvatar from './icon-avatar'

export default class Icon4Avatar extends Group {
    constructor(container, nw, ne, sw, se, x, y, w, h) {
        super(container)
        const w2 = w / 2
        const h2 = h / 2
        const w4 = w / 4
        const h4 = h / 4
        new IconAvatar(this, nw, x - w4, y - h4, w2, h2)
        new IconAvatar(this, ne, x + w4, y - h4, w2, h2)
        new IconAvatar(this, sw, x - w4, y + h4, w2, h2)
        new IconAvatar(this, se, x + w4, y + h4, w2, h2)
    }
    
    // TODO: this probably shouldn't be its own class but instead a method added to Group and a factory function
    bounds() {
        let first = true
        let left, top, right, bottom
        this.walkContents(avatar => {
            if(first) {
                first = false
                const rect = avatar.bounds()
                left = rect[0]
                top = rect[1]
                right = left + rect[2]
                bottom = top + rect[3]
                return
            }
            
            let [left2, top2, width2, height2] = avatar.bounds()
            let right2 = left2 + width2
            let bottom2 = top2 + height2
            
            left = Math.min(left, left2)
            top = Math.min(top, top2)
            right = Math.max(right, right2)
            bottom = Math.max(bottom, bottom2)
        })
        if(first)
            return [0, 0, 0, 0] // TODO: refactor to allow returning undefined or something
        
        return [left, top, right - left, bottom - top]
    }
}
