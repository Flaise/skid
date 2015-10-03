'use strict';

var sanity = require('./sanity');
var Group = require('./group');
var is = require('./is');

function Smoothing(avatars) {
    Group.call(this, avatars);
    sanity.attribute(this, 'enabled', false, is.boolean);
}
Smoothing.prototype = Object.create(Group.prototype);
module.exports = exports = Smoothing;

Smoothing.prototype.draw = function (context) {
    context.webkitImageSmoothingEnabled = this.enabled;
    context.mozImageSmoothingEnabled = this.enabled;
    Group.prototype.draw.call(this, context);
};
//# sourceMappingURL=smoothing.js.map