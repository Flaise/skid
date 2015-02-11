'use strict';
var LinkedList = require('./linkedlist');
var EventDispatcher = require('./eventdispatcher');
var Camera = require('./camera');
var is = require('./is');
var Interpolands = require('./interpolands');
var Avatars = require('./avatars');
var sanity = require('./sanity');

var onAnimFrame = (function () {
    var requestAnimFrame = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || (function (callback) {
        return window.setTimeout(callback, 1000 / 60);
    }));
    var dispatcher = new EventDispatcher();
    dispatcher.listen(requestAnimFrame.bind(undefined, function () {
        return dispatcher.proc();
    }));
    dispatcher.proc();
    return dispatcher;
})();

var Viewport = (function () {
    /*
    * Turning off clearBeforeDraw can mitigate rendering artifacts caused by tiling alpha blended
    * background images.
    */
    function Viewport(canvas, clearBeforeDraw) {
        this.canvas = canvas;
        this.clearBeforeDraw = clearBeforeDraw;
        this.cameras = new LinkedList();
        this.interpolands = new Interpolands();
        this.onBeforeDraw = new EventDispatcher();
        this.onAfterDraw = new EventDispatcher();
        sanity(this.canvas);
    }
    Viewport.prototype.makeCamera = function () {
        var camera = new Camera(new Avatars(this.interpolands));
        this.cameras.addLast(camera);
        return camera;
    };

    Viewport.prototype.repeatDraw = function () {
        var _this = this;
        return onAnimFrame.listen(function () {
            return _this.draw();
        });
    };

    Viewport.prototype.draw = function () {
        this.onBeforeDraw.proc();

        this.update();

        // Firefox bugs in some situations if context is reused
        var context = this.canvas.getContext('2d');

        if (this.clearBeforeDraw)
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.cameras.forEach(function (camera) {
            return camera.draw(context);
        });

        this.onAfterDraw.proc();
    };

    Viewport.prototype.update = function () {
        if (is.nullish(this.lastFrame))
            this.lastFrame = Date.now();

        var currentFrame = Date.now();
        var dt = currentFrame - this.lastFrame;
        this.lastFrame = currentFrame;
        this.interpolands.update(dt);
    };
    return Viewport;
})();
module.exports = Viewport;
