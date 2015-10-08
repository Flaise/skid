let func
if(typeof window === 'undefined')
    // for unit testing in Node
    func = (callback => setTimeout(callback, 1000 / 60))
else
    func = (
        window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || (callback => window.setTimeout(callback, 1000 / 60))
    )

export default func
