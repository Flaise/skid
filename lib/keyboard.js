'use strict';

var Reactant = require('./reactant');

function isReactant(stuff) {
    return stuff && stuff !== true;
}

// depressed = true
// unpressed = false
function Keyboard(element) {
    this.states = {};

    element.addEventListener('keydown', (function (e) {
        var type = document.activeElement.type;
        if (type === 'textarea' || type === 'text' || type === 'password' || type === 'number') return; // TODO: this doesn't account for holding the button while switching focus

        // entry is one of: [ undefined, true, false, {Reactant} ]
        if (isReactant(this.states[e.keyCode])) this.states[e.keyCode].value = true;else this.states[e.keyCode] = true;
    }).bind(this));
    element.addEventListener('keyup', (function (e) {
        if (isReactant(this.states[e.keyCode])) this.states[e.keyCode].value = false;else this.states[e.keyCode] = false;
    }).bind(this));
}
module.exports = exports = Keyboard;

Keyboard.prototype.getKeyState = function (keyCode) {
    if (isReactant(this.states[keyCode])) return this.states[keyCode].value;else return !!this.states[keyCode];
};
Keyboard.prototype.getKey = function (keyCode) {
    var state = this.states[keyCode];
    if (isReactant(state)) return state;
    state = new Reactant(!!state);
    this.states[keyCode] = state;
    return state;
};
//# sourceMappingURL=keyboard.js.map