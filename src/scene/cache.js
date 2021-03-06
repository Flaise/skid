import {Group} from './group'
import {Translation} from './translation'
import {Scalement} from './scalement'

export class Cache extends Group {
    constructor(container, tileSize) {
        super(container)
        this._tileSize = tileSize
        this._canvas = document.createElement('canvas')
        this._context = this._canvas.getContext('2d')
        this._altered = false
        this._x = 0
        this._y = 0
        this._width = 0
        this._height = 0
    }

    draw(context) {
        if(this._altered) {
            this._altered = false

            const bounds = this.bounds()
            if(bounds) {
                ;[this._x, this._y, this._width, this._height] = bounds
                this._canvas.width = Math.ceil(this._width * this._tileSize)
                this._canvas.height = Math.ceil(this._height * this._tileSize)
            } else {
                this._canvas.width = 0
                this._canvas.height = 0
            }

            if(!this._canvas.width || !this._canvas.height)
                return

            Scalement.draw(this._context, this._tileSize, this._tileSize, () => {
                Translation.draw(this._context, -this._x, -this._y, () => {
                    super.draw(this._context)
                })
            })
        }
        else if(!this._canvas.width || !this._canvas.height)
            return

        context.drawImage(this._canvas, 0, 0, this._canvas.width, this._canvas.height,
                          this._x, this._y, this._width, this._height)
    }
}
