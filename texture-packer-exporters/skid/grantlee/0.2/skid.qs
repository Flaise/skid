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
    
    var nameTokens = trimmedName.split('_')
    
    layout.name = nameTokens[0]
    
    var ax = Number(nameTokens[1])
    if(isNaN(ax))
        ax = untrimmedWidth / 2
    var axRel = ax / untrimmedWidth
    
    var ay = Number(nameTokens[2])
    if(isNaN(ay))
        ay = untrimmedHeight / 2
    var ayRel = ay / untrimmedHeight
    
    var diameter = Number(nameTokens[3])
    if(isNaN(diameter)) {
        // fill square tile if no diameter is specified
        if(untrimmedHeight > untrimmedWidth) {
            layout.sx = 1
            layout.sy = untrimmedHeight / untrimmedWidth
        }
        else {
            layout.sy = 1
            layout.sx = untrimmedWidth / untrimmedHeight
        }
    }
    else {
        layout.sx = untrimmedWidth / diameter
        layout.sy = untrimmedHeight / diameter
    }
    
    if(solid) {
        layout.solid = true
        layout.wFactor = layout.sx * -axRel
        layout.hFactor = layout.sy * -ayRel
    }
    else {
        // Corrects for seams in tile fields caused by precision loss
        // TODO: experiment with splitting numerator from denomonator instead
        if(localX % 2 !== 0) {
            localX -= 1
            localW += 1
        }
        if(localY % 2 !== 0) {
            localY -= 1
            localH += 1
        }
        
        layout.insetWRel = (localW - untrimmedWidth) / untrimmedWidth
        layout.insetHRel = (localH - untrimmedHeight) / untrimmedHeight
        
        var insetXRel = localX / untrimmedWidth
        var insetYRel = localY / untrimmedHeight
        
        layout.wFactor = layout.sx * (insetXRel - axRel)
        layout.hFactor = layout.sy * (insetYRel - ayRel)
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
