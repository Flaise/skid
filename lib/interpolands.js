'use strict';

var ObjectPool = require('./object-pool');
var sanity = require('./sanity');
var is = require('./is');
var tween = require('./tween');

function Interpoland(tweens, value) {
    value = value || 0;
    this.curr = value;
    this.base = value;
    this.dest = value;
    this.tweens = tweens;
    this.removed = false;
}
Interpoland.prototype.mod = function (delta, duration, tweenFunc, onDone, remainder) {
    this.dest += delta;
    return this.tweens.make(this, delta, delta, duration, tweenFunc, onDone, remainder);
};
Interpoland.prototype.modTo = function (dest, duration, tweenFunc, onDone, remainder) {
    return this.mod(dest - this.dest, duration, tweenFunc, onDone, remainder);
};
Interpoland.prototype.modNow = function (delta) {
    this.base += delta;
    this.curr += delta;
    this.dest += delta;
};
Interpoland.prototype.modToNow = function (dest) {
    this.modNow(dest - this.dest);
};
Interpoland.prototype.setTo = function (dest) {
    this.base = dest;
    this.curr = dest;
    this.dest = dest;
    this.tweens.removeInterpolands([this]); // TODO
};
Interpoland.prototype.setToInitial = function (dest) {
    this.base = dest;
    this.curr = dest;
    this.dest = dest;
};
Interpoland.prototype.mod_noDelta = function (amplitude, duration, tweenFunc, onDone, remainder) {
    return this.tweens.make(this, 0, amplitude, duration, tweenFunc, onDone, remainder);
};
Interpoland.prototype.remove = function () {
    this.removed = true;
};
sanity.noAccess(Interpoland.prototype, 'value');

function Interpolands() {
    ObjectPool.call(this, Interpoland);
    this.tweens = new Tweens();
}
Interpolands.prototype = Object.create(ObjectPool.prototype);

Interpolands.prototype.setTo = function (interpolands, dest) {
    for (var i = 0; i < interpolands.length; i += 1) {
        var interpoland = interpolands[i];
        interpoland.base = dest;
        interpoland.curr = dest;
        interpoland.dest = dest;
    }
    this.tweens.removeInterpolands(interpolands);
};
Interpolands.prototype.setToMany = function (interpolands, dests) {
    for (var i = 0; i < interpolands.length; i += 1) {
        var interpoland = interpolands[i];
        var dest = dests[i];
        interpoland.base = dest;
        interpoland.curr = dest;
        interpoland.dest = dest;
    }
    this.tweens.removeInterpolands(interpolands);
};

Interpolands.prototype.make = function (value) {
    return ObjectPool.prototype.make.call(this, this.tweens, value);
};
Interpolands.prototype.remove = undefined;

Interpolands.prototype.update = function (dt) {
    var shiftBy = 0;
    for (var i = 0; i < this.aliveCount; i += 1) {
        var interpoland = this.alive[i];

        if (interpoland.removed) {
            this.dead[this.deadCount] = interpoland;
            this.deadCount += 1;
            shiftBy += 1;
        } else {
            if (shiftBy && i - shiftBy >= 0) this.alive[i - shiftBy] = interpoland;
            interpoland.curr = interpoland.base;
        }
    }
    this.aliveCount -= shiftBy;
    this.tweens.update(dt);
};

Interpolands.prototype.clear = function () {
    ObjectPool.prototype.clear.call(this);
    this.tweens.clear();
};

module.exports = exports = Interpolands;

function Tween(interpoland, dest, amplitude, duration, func, onDone, remainder) {
    if (sanity.throws) {
        sanity(is.object(interpoland));
        if (sanity(is.number(dest))) dest = 0;
        if (sanity(is.number(amplitude))) amplitude = dest;
        if (sanity(is.number(duration))) duration = 0;
        if (sanity(is['function'](func))) func = tween.linear;
        if (sanity(is.nullish.or['function'](onDone))) onDone = undefined;
        if (sanity(is.number(remainder))) remainder = 0;
    }

    this.interpoland = interpoland;
    this.curr = 0;
    this.elapsed = remainder;
    this.dest = dest;
    this.duration = duration;
    this.func = func;
    this.onDone = onDone;
    this.amplitude = amplitude;
}

function Tweens() {
    ObjectPool.call(this, Tween);
    this.ending = [];
    this.remainder = 0;
}
Tweens.prototype = Object.create(ObjectPool.prototype);

Tweens.prototype.make = function (interpoland, dest, amplitude, duration, func, onDone, remainder) {
    if (is.nullish(remainder)) remainder = this.remainder;
    return ObjectPool.prototype.make.call(this, interpoland, dest, amplitude, duration, func, onDone, remainder);
};

Tweens.prototype.removeInterpolands = function (removals, count) {
    if (count === 0) return;
    count = count || removals.length;
    sanity(count <= removals.length);

    var shiftBy = 0;
    for (var i = 0; i < this.aliveCount; i += 1) {
        var tween = this.alive[i];

        var deleting = false;
        for (var j = 0; j < count; j += 1) {
            if (removals[j] === tween.interpoland) {
                deleting = true;
                break;
            }
        }

        if (deleting) {
            this.dead[this.deadCount] = tween;
            this.deadCount += 1;
            shiftBy += 1;
        } else if (shiftBy && i - shiftBy >= 0) this.alive[i - shiftBy] = tween;
    }
    this.aliveCount -= shiftBy;
};
Tweens.prototype.update = function (dt) {
    var endingCount = 0;
    var shiftBy = 0;
    for (var i = 0; i < this.aliveCount; i += 1) {
        var tween = this.alive[i];
        tween.elapsed += dt;

        if (tween.interpoland.removed) {
            shiftBy += 1;

            this.dead[this.deadCount] = tween;
            this.deadCount += 1;
        } else if (tween.elapsed >= tween.duration) {
            shiftBy += 1;

            if (tween.onDone) {
                this.ending[endingCount] = tween;
                endingCount += 1;
            } else {
                this.dead[this.deadCount] = tween;
                this.deadCount += 1;
            }

            tween.interpoland.curr += tween.dest;
            tween.interpoland.base += tween.dest;
        } else {
            tween.interpoland.curr += tween.amplitude * tween.func(tween.elapsed / tween.duration);

            if (shiftBy && i - shiftBy >= 0) this.alive[i - shiftBy] = tween;
        }
    }
    this.aliveCount -= shiftBy;
    for (var i = 0; i < endingCount; i += 1) {
        var tween = this.ending[i];

        this.remainder = tween.elapsed - tween.duration;
        tween.onDone(this.remainder);
        tween.onDone = undefined;
        this.dead[this.deadCount] = tween;
        this.deadCount += 1;
    }
    this.remainder = 0;
};
//# sourceMappingURL=interpolands.js.map