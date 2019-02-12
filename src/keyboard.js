import {is} from './is'

const states = Object.create(null)

export function reset() {
    for(let k of Object.keys(states))
        delete states[k]
}

window.addEventListener('keydown', (e) => {
    const type = window.document.activeElement.type
    if(type === 'textarea' || type === 'text' || type === 'password' || type === 'number')
        return // TODO: this doesn't account for holding the button while switching focus

    states[e.keyCode] = true
})
window.addEventListener('keyup', (e) => {
    states[e.keyCode] = false
})

export function stateOf(keyCode) {
    if(is.object(states[keyCode]))
        return states[keyCode].value
    else
        return !!states[keyCode]
}
