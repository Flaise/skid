import {Group} from './group'
import {is} from '../is'
import {addHandler, handle} from '../event'

export class Viewport extends Group {
    constructor(state, canvas) {
        super()
        this._canvas = canvas
        this.lastFrame = undefined // TODO: move to interpolands module
        this.animFrame = false

        this.animationFrame = () => {
            this.animFrame = false
            this.draw()
            if(!this.animFrame)
                this.lastFrame = undefined
        }

        this.resize = () => this.changed()
        if(typeof window !== 'undefined') { // for unit testing in Node
            window.addEventListener('resize', this.resize)
        }

        this.state = state
        state.skid.viewport = this
    }

    set canvas(value) {
        if(this._canvas === value)
            return
        this._canvas = value
        this.changed()
    }

    subremove() {
        window.removeEventListener('resize', this.resize)
    }

    changed() {
        if(this.animFrame)
            return
        if(is.nullish(this.lastFrame))
            this.lastFrame = Date.now()
        this.animFrame = true
        animationFrame(this.animationFrame)
    }

    draw() {
        if(!this._canvas)
            return

        const currentFrame = Date.now()
        handle(this.state, 'interpolate', currentFrame - this.lastFrame)
        this.lastFrame = currentFrame

        super.draw(this._canvas.getContext('2d'))
    }
}

addHandler('request_redraw', (state) => {
    if (state.skid.viewport) {
        // TODO: do this without instance method
        state.skid.viewport.changed()
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
