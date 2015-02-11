'use strict'

var Avatar = require('./avatar')
var sanity = require('./sanity')
var turns = require('./turns')


function PiePaths(avatars) {
    Avatar.call(this, avatars)
    sanity.constants(this, {
        _paths: [],
        _interpolandGroup: avatars.interpolands,
        _interpolands: []
    })
}
PiePaths.prototype = Object.create(Avatar.prototype)
module.exports = exports = PiePaths

PiePaths.prototype.remove = function() {
    if(this.removed)
        return
    this._interpolandGroup.remove(this._interpolands)
    Avatar.prototype.remove.call(this)
}

PiePaths.prototype.draw = function(context) {
    for(var i = 0; i < this._paths.length; i += 1) {
        var path = this._paths[i]
        
        if(!path.scale.curr)
            continue
        
        var startAngle = path.startAngle - .25
        var endAngle = startAngle + path.breadth
        startAngle = turns.toRadians(startAngle)
        endAngle = turns.toRadians(endAngle)
        
        context.moveTo(0, 0)
        context.arc(0, 0, path.scale.curr / 2 * path.innerRadius, endAngle, startAngle,
                    path.breadth >= 0)
        context.arc(0, 0, path.scale.curr / 2, startAngle, endAngle, path.breadth < 0)
    }
}

PiePaths.prototype.make = function(breadth, startAngle, innerRadius, scale) {
    var scalement = this._interpolandGroup.make(scale || 1)
    this._interpolands.push(scalement)
    var result = {
        // Distance of second jaw from first jaw. Positive is clockwise.
        breadth: breadth,
        
        // Distance of first jaw from north. Positive is clockwise.
        startAngle: startAngle,
        
        innerRadius: innerRadius
    }
    sanity.constant(result, 'scale', scalement)
    this._paths.push(result)
    return result
}
