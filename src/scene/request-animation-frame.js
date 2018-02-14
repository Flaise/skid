let func
if(typeof window === 'undefined')
    // for unit testing in Node
    func = (callback => setTimeout(callback, 1000 / 60))
else {
    func = (
        window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
    )
    if(func)
        func = func.bind(window)
    else
        func = (callback => window.setTimeout(callback, 1000 / 60))
}

export const animationFrame = func
