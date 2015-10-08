import Reactant from './reactant'
import is from './is'

const states = Object.create(null)

window.addEventListener('keydown', (e) => {
    const type = window.document.activeElement.type
    if(type === 'textarea' || type === 'text' || type === 'password' || type === 'number')
        return // TODO: this doesn't account for holding the button while switching focus

    // entry is one of: [ undefined, true, false, {Reactant} ]
    if(is.object(states[e.keyCode]))
        states[e.keyCode].value = true
    else
        states[e.keyCode] = true
})
window.addEventListener('keyup', (e) => {
    if(is.object(states[e.keyCode]))
        states[e.keyCode].value = false
    else
        states[e.keyCode] = false
})

export function stateOf(keyCode) {
    if(is.object(states[keyCode]))
        return states[keyCode].value
    else
        return !!states[keyCode]
}
export function keyOf(keyCode) {
    let state = states[keyCode]
    if(!is.object(state)) {
        state = new Reactant(!!state)
        states[keyCode] = state
    }
    return state
}
