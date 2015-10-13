import Avatar from './avatar'
import {toRadians} from '../turns'

export default class PiePaths extends Avatar {
    constructor(avatars) {
        super(avatars)
        this._paths = []
        this._interpolands = avatars.interpolands
    }
    
    draw(context) {
        for(var i = 0; i < this._paths.length; i += 1) {
            const path = this._paths[i]
            if(!path.scale.curr)
                continue
            
            let startAngle = path.startAngle - .25
            let endAngle = startAngle + path.breadth
            startAngle = toRadians(startAngle)
            endAngle = toRadians(endAngle)
            
            context.moveTo(0, 0)
            context.arc(0, 0, path.scale.curr / 2 * path.innerRadius, endAngle, startAngle,
                        path.breadth >= 0)
            context.arc(0, 0, path.scale.curr / 2, startAngle, endAngle, path.breadth < 0)
        }
    }
    
    make(breadth, startAngle, innerRadius, scale) {
        const result = {
            // Distance of second jaw from first jaw. Positive is clockwise.
            breadth: breadth,
            
            // Distance of first jaw from north. Positive is clockwise.
            startAngle: startAngle,
            
            innerRadius: innerRadius,
            scale: this._interpolands.make(scale || 1)
        }
        this._paths.push(result)
        return result
    }
    
    subremove() {
        for(var i = 0; i < this._paths.length; i += 1)
            this._paths[i].scale.remove()
    }
}
