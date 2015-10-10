'use strict'

function compute(trimmedName, untrimmedWidth, untrimmedHeight,
                 sourceX, sourceY, sourceW, sourceH,
                 solid,
                 localX, localY, localW, localH) {
    
    var layout = {}
    layout.x = sourceX
    layout.y = sourceY
    layout.w = sourceW
    layout.h = sourceH
    if(solid) {
        layout.solid = true
    }
    else {
        layout.insetXRel = localX / untrimmedWidth
        layout.insetYRel = localY / untrimmedHeight
        layout.insetWRel = (localW - untrimmedWidth) / untrimmedWidth
        layout.insetHRel = (localH - untrimmedHeight) / untrimmedHeight
    }
    
    var nameTokens = trimmedName.split('_')
    
    layout.name = nameTokens[0]
    
    var ax = Number(nameTokens[1])
    if(isNaN(ax))
        ax = untrimmedWidth / 2
    layout.axRel = ax / untrimmedWidth
    
    var ay = Number(nameTokens[2])
    if(isNaN(ay))
        ay = untrimmedHeight / 2
    layout.ayRel = ay / untrimmedHeight
    
    var diameter = Number(nameTokens[3])
    if(isNaN(diameter)) {
        // fill square tile if no diameter is specified
        if(untrimmedHeight > untrimmedWidth) {
            layout.sx = 1
            layout.sy = untrimmedHeight / untrimmedWidth
        } else {
            layout.sy = 1
            layout.sx = untrimmedWidth / untrimmedHeight
        }
    } else {
        layout.sx = untrimmedWidth / diameter
        layout.sy = untrimmedHeight / diameter
    }
    return layout
}
if(typeof exports !== 'undefined')
    exports.compute = compute

function skid(allSprites) {
    try {
        var result = {}
        for(var i = 0; i < allSprites.length; i += 1) {
            var sprite = allSprites[i]
            
            var current = compute(sprite.trimmedName,
                                  sprite.untrimmedSize.width, sprite.untrimmedSize.height,
                                  sprite.frameRect.x, sprite.frameRect.y,
                                  sprite.frameRect.width, sprite.frameRect.height,
                                  sprite.isSolid,
                                  sprite.sourceRect.x, sprite.sourceRect.y,
                                  sprite.sourceRect.width, sprite.sourceRect.height)
            
            result[current.name] = current
        }
        return JSON.stringify(result, undefined, 4)
    }
    catch(err) {
        return JSON.stringify(err.stack || err, undefined, 4)
    }
}
skid.filterName = 'skid'

if(typeof Library !== 'undefined')
    Library.addFilter('skid')
