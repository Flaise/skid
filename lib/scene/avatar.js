'use strict';

var sanity = require('./sanity'); // TODO: factor into external library
var is = require('./is');

function Avatar(avatars) {
    this._layer = undefined;
    sanity.constant(this, '_node', avatars.alive.addLast(this));

    if (sanity.throws) this._avatars = avatars;
}
module.exports = exports = Avatar;

Object.defineProperty(Avatar.prototype, 'layer', {
    get: function get() {
        return this._layer;
    },
    set: function set(value) {
        sanity(!(this._avatars && this._avatars._iterating));
        if (sanity(is.number(value))) return;
        if (value === this._layer) return;
        this._layer = value;
        this._shift();
    }
});

Avatar.prototype._shift = function () {
    if (sanity(!this.removed)) return;
    while (true) {
        var prev = this._node.prev;
        var prev_prev = prev.prev;
        var next = this._node.next;

        if (!prev.value) break;
        if (is.defined(prev.value._layer) && prev.value._layer <= this._layer) break;

        prev.next = next;
        prev_prev.next = this._node;
        prev.prev = this._node;
    }

    while (true) {
        var prev = this._node.prev;
        var next = this._node.next;
        var next_next = next.next;

        if (!next.value) break;
        if (is.nullish(next.value._layer) || next.value._layer >= this._layer) break;

        next.prev = prev;
        next_next.prev = this._node;
        next.next = this._node;
    }
};

Object.defineProperty(Avatar.prototype, 'removed', { get: function get() {
        return this._node.removed;
    } });

Avatar.prototype._avatar_remove = function () {
    this._node.remove();
};
Avatar.prototype.remove = Avatar.prototype._avatar_remove;

Avatar.prototype.draw = function _abstract() {
    sanity(false);
};
//# sourceMappingURL=avatar.js.map