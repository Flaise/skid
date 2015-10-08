'use strict'

function skid(allSprites) {
    try {
        var result = {}
        for(var i = 0; i < allSprites.length; i += 1) {
            var sprite = allSprites[i]
            
            var ow = sprite.untrimmedSize.width
            var oh = sprite.untrimmedSize.height
            
            var nameTokens = sprite.trimmedName.split('_')
            var name = nameTokens[0]
            
            var ax = Number(nameTokens[1])
            var ay = Number(nameTokens[2])
            if(isNaN(ax))
                ax = sprite.pivotPoint.x
            if(isNaN(ay))
                ay = sprite.pivotPoint.y
            
            var diameter = Number(nameTokens[3])
            var sx
            var sy
            if(isNaN(diameter)) {
                // fill square tile if no diameter is specified
                if(oh > ow) {
                    sx = 1
                    sy = oh / ow
                } else {
                    sy = 1
                    sx = ow / oh
                }
            } else {
                sx = ow / diameter
                sy = oh / diameter
            }
            
            var current = {
                name: name, // for debugging
                x: sprite.frameRect.x,
                y: sprite.frameRect.y,
                w: sprite.frameRect.width,
                h: sprite.frameRect.height,
                axRel: ax / ow,
                ayRel: ay / oh,
                sx: sx,
                sy: sy
            }
            
            if(sprite.isSolid) {
                current.solid = true
            } else {
                current.insetXRel = sprite.sourceRect.x / ow
                current.insetYRel = sprite.sourceRect.y / oh
                current.insetWRel = (sprite.sourceRect.width - ow) / ow
                current.insetHRel = (sprite.sourceRect.height - oh) / oh
            }
            
            result[name] = current
        }
        return JSON.stringify(result, undefined, 4)
    }
    catch(err) {
        return JSON.stringify(err.stack || err)
    }
}
skid.filterName = 'skid'
Library.addFilter('skid')
