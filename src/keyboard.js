import Reactant from './reactant'
import is from './is'

const depressed = true
const unpressed = false

export default class Keyboard {
    constructor(element) {
        this.states = Object.create(null)
        
        element.addEventListener('keydown', (e) => {
            const type = window.document.activeElement.type
            if(type === 'textarea' || type === 'text' || type === 'password' || type === 'number')
                return // TODO: this doesn't account for holding the button while switching focus

            // entry is one of: [ undefined, true, false, {Reactant} ]
            if(is.object(this.states[e.keyCode]))
                this.states[e.keyCode].value = depressed
            else
                this.states[e.keyCode] = depressed
        })
        element.addEventListener('keyup', (e) => {
            if(is.object(this.states[e.keyCode]))
                this.states[e.keyCode].value = unpressed
            else
                this.states[e.keyCode] = unpressed
        })
    }
    keyState(keyCode) {
        if(is.object(this.states[keyCode]))
            return this.states[keyCode].value
        else
            return !!this.states[keyCode]
    }
    key(keyCode) {
        let state = this.states[keyCode]
        if(is.object(state))
            return state
        state = new Reactant(!!state)
        this.states[keyCode] = state
        return state
    }
}
