/*
 * Executes a callback a given amount of time after the last time the delayed event is triggered.
 * For example, if the delay is 5 seconds and the event is triggered twice at an interval of 2
 * seconds then the callback would be called 7 seconds after the first trigger.
 */
export class Procrastinator {
    constructor(duration, doThis) {
        this._duration = duration
        this._bestBefore = undefined
        this._stopThat = undefined
        this._doThis = doThis
    }

    doItLater(doThisInstead) {
        if(arguments.length > 0)
            this._doThis = doThisInstead

        this._bestBefore = Date.now() + this._duration
        this._procrastinate()
    }

    _procrastinate() {
        this.neverMind()

        if(!this._doThis)
            return

        this._stopThat = setTimeout(() => {
            if(Date.now() < this._bestBefore)
                // Browser may be imprecise
                this._procrastinate()
            else
                this._doThis()
        }, this.duration)
    }

    neverMind() {
        clearTimeout(this._stopThat)
    }
}
