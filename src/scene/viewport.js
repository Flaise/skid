import {Group} from './group'
import {is} from '../is'
import {addHandler, handle} from '../event'

export function makeViewport(state, canvas) {
    const result = new Group()
    state.skid.viewport = result
    state.skid.canvas = canvas
    return result
}

export function setCanvas(state, canvas) {
    state.skid.canvas = canvas
    handle(state, 'request_draw')
}

export function canvasOf(state) {
    return state.skid.canvas
}

export function contextOf(state) {
    return state.skid.canvas && state.skid.canvas.getContext('2d')
}

addHandler('request_draw', (state) => {
    if (state.skid.willDraw) {
        return
    }
    state.skid.willDraw = true
    if (is.nullish(state.skid.lastFrame)) {
        state.skid.lastFrame = Date.now()
    }

    animationFrame(() => {
        const currentFrame = Date.now()
        handle(state, 'before_draw', currentFrame - state.skid.lastFrame)
        const context = contextOf(state)
        if (state.skid.viewport && context) {
            state.skid.viewport.draw(context)
        }
        state.skid.willDraw = false
        handle(state, 'after_draw')
        if (state.skid.willDraw) {
            state.skid.lastFrame = currentFrame
        } else {
            state.skid.lastFrame = undefined
        }
    })
})

addHandler('load_done', (state) => {
    if(typeof window !== 'undefined') { // for unit testing in Node
        window.addEventListener('resize', () => handle(state, 'request_draw'))
    }
})

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

const animationFrame = func
