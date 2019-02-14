Skid
====

2d game engine for Node/HTML5. Designed in a roughly data-oriented fashion and supporting 2d rendering, user input, and message passing. Audio is handled by [Howler.js](https://github.com/goldfire/howler.js#documentation). Skid has seen the most use in game jams, in such games as:

- Comparative Advantage: [Game Page](https://flaise.itch.io/comparative-advantage) | [Repository](https://github.com/Flaise/comparative_advantage)
- Defend your Homeworld: [Repository](https://github.com/Vulpinity/homeworld)

*(Want your project added to the list? Create a pull request.)*

Installation
============

    $ npm install --save skid

Skid is designed primarily with the browser in mind, although its module system requires Commonjs or ES6 module support. If using Browserify or Webpack, import modules from `'skid/lib/*'`, such as `const {addHandler} = require('skid/lib/event');`. If using a module-aware packaging system such as Rollup, you can import from `'skid/src/*'` instead.

License
=======

Public Domain

---

How to get the most out of Skid
===============================

## A program is a data structure

Design your code around the data, not the other way around. A game is a data structure that changes in response to user input and the passage of time. In Skid, all such changes start with event handlers:

```
const {addHandler, handleInterval} = require('skid/lib/event');

// This line makes the 'key' event begin working
require('skid/lib/keyboard');

addHandler('load', (state) => {
    // This executes when the application begins to load
});

addHandler('load_done', (state) => {
    // Start handling an event on a 1000ms interval
    handleInterval(state, 1000, 'log_status');
});

addHandler('key', (state, event) => {
    state.eventCount = (state.eventCount || 0) + 1;
});

addHandler('log_status', (state) => {
    // Log the status every 1000ms
    console.log('events:', state.eventCount || 0);
});
```

The `state` parameter to each of the above handlers is the root data structure for the entire program. Any change in state that should be later read by either the current module or another module should go in the `state` object.

A typical entry point module using Skid looks similar to this:

```
require('./network');
require('./appearance');
require('./physics');
require('./music');
require('./score');
require('./something_else');
require('./another_module');
require('./et_cetera');
require('./et_all');
require('./yeah_ok');

const {start} = require('skid/lib/load');
start();
```

The entry point requires all of the game modules, which implicitly runs their initialization code, which should do little more than export some top-level functions and register event handlers. When all the handlers are ready, it calls `start()`, which creates the global `state` object and starts the loading sequence. Call `start(true)` instead to see each event logged to the console as it is triggered.

## Favor explicit conditionals

Consider the following two code snippets:

```
something.on('start', () => {

});
```

```
addHandler('start', (state, entity) => {
    if (entity === something) {

    }
});
```

Both styles are equivalent but the second is superior because the conditional is explicit. The implicit style looks superficially simpler but it often turns into a big source of debugging and performance optimization hassle.

This also means avoid calling `addHandler()` inside of another handler. Changing the list of handlers at runtime is another example of an implicit conditional. All handlers should be added as the program starts up, before the `load` event triggers.

Similarly, the `handleInterval()` function should almost always be called in a `load_done` handler. Calling it elsewhere is usually not what you want, although for some applications it may be appropriate.

Closures are generally only useful for two things in this kind of program architecture: asynchronous code such as event handlers, timers, and I/O, and short-term processing of data structures, such as `Array#forEach`. To put a closure anywhere else will usually create unnecessary implicit conditionals.

## Write one and only one module at a time

Every module should directly modify only its own control flow. All communication with other modules is via altering the data in the global `state` object or by triggering an event. Modules should not make assumptions about the behavior, presence, or absence of other modules. Invariant checks/runtime assertions can help isolate and solve problems when running a program in debug mode but these checks should be absent in release mode.

Don't raise runtime exceptions. At best, they are a performance-intensive substitute for other control flow constructs. Usually they violate this "write one and only one module at a time" principle by changing the behavior of any or all modules that handle the same event as the one raising an exception. At worst, an exception can halt the process. It is NEVER acceptable for a video game to crash.

Avoiding object lifecycles where possible will minimize edge cases and in particular will often simplify handling inputs from the network and file system. Since byte streams such as networks and file systems behave somewhat unpredictably, often have invalid data, and can not generally give stack traces, a program can be designed to fail gracefully by simply creating an object/entity whenever the first reference to it is encountered. Additionally, this makes it easier to test modules in isolation.

In the Skid program architecture, there isn't a proper concept of data "ownership" the way you might expect from an object oriented program architecture. All data is in the global `state` object that all handlers have access to. Don't hide data with private class members or closures because that restricts the options available to all other modules in the program. Make the decision as to whether to modify a particular piece of data for each module as you write it, not in the one module that just so happens to be the first one written to use a particular piece of data.

A good rule of thumb for following this principle is that you should strive to make your modules so that you can rip them out of your program by commenting out the import statements that initialize them without breaking the behavior of the rest of the modules in the program. For example:

```
require('./physics');
require('./monsters');
require('./player');
// require('./background');
// ^-- The background is gone but the game should execute without error
// and remain playable.

const {start} = require('skid/lib/load');
start();
```

## Write simple, dumb code

Which code snippet is easier to debug? This one:

```
addHandler('load', (state) => {
    state.backgroundLayers = [
        {data: 0},
        {data: 0},
    ];
});

addHandler('update', (state) => {
    for (const layer of state.backgroundLayers) {
        layer.data += 1;
    }
});
```

or this one?:

```
const oldUpdate = EntityManager.prototype.update;
EntityManager.prototype.update = function() {
    oldUpdate.apply(this, arguments);
    for (const layer of this.backgroundLayers) {
        layer.update();
    }
};

let entityManager = new EntityManager();
entityManager.backgroundLayers = [];

class BackgroundLayer {
    constructor(manager) {
        this.data = 0;
        manager.backgroundLayers.push(this);
    }

    update() {
        this.data += 1;
    }
}

new BackgroundLayer(entityManager);
new BackgroundLayer(entityManager);

updaters.push(entityManager.update.bind(entityManager));

function updateAll() {
    for (const updater of updaters) {
        updater();
    }
}
```

The second example is full of unnecessary edge cases and indirection. Coders usually add edge cases and indirection like this to a project to make it scale better. In many cases this makes the project scale *worse*, not better. Scalable code is simple code.

When writing a Skid app, don't use object prototypes, don't override functions with inheritance or monkey patching, don't use implicit inputs such as `this`, `arguments`, or global variables, don't iterate over heterogenous lists, don't use partial function applications, don't use computed properties, and don't use any of those design patterns they teach you in university.

Stop overthinking everything.

Your modules should be made out of top-level functions that compute results from their inputs, top-level functions that modify their inputs, and when an existing behavior must be modified, use an event handler. That makes up 90+% of a Skid application. Pretend you're programming in a memory-managed version of C.

---

API
===

## /event

This file is the core of Skid. Everything is built around the event handling system.

### `addHandler(code, handler)`
### `handle(state, code, parameter)`

Example usage:

```
addHandler('something', (state, thing) => {
    console.log(thing); // prints '3'
});

addHandler('load', (state) => {
    handle(state, 'something', 3);
});

const {start} = require('skid/lib/load');
start(); // This triggers the 'load' event.
```

Call `addHandler` in the top-level of all modules so all handlers are installed before the `start` function is called. The `start` function constructs the initial state of the application and the first time your code has access to it is through a `'load'` handler.

The `code` argument of `addHandler` is either a string, something that can be converted to a string, or a list of such objects. If it is a string with spaces, the spaces are used to split the code into more than one code. Thus,

```
addHandler('a b', ...);
```

is equivalent to

```
addHandler(['a', 'b'], ...);
```

and both of those are equivalent to

```
addHandler('a', ...);
addHandler('b', ...);
```

### `silence(code_or_codes)`

Call this to filter events from the event log when running in debug mode to keep the console from getting too noisy. Example:

```
const {silence} = require('skid/lib/event');
silence(['before_draw', 'after_draw']);

const {start} = require('skid/lib/load');
start();
```

## /vector2

2d vector math. Includes arithmetic, distance calculations, and rotation. See the source for the API.

## /scalars

Utility functions for basic linear arithmetic. See the source for the API.

## /array

Utility functions for dealing with built-in arrays. See the source for the API.

## /turns

Angular arithmetic. Skid uses a floating point value of 1.0 to represent 360 degrees because reading and writing code becomes much easier when we use values such as `.5`, `.125`, `-2.5`, instead of `Math.PI`, `Math.PI / 4`, and `Math.PI * -9`, respectively, as is often used in graphics programming. Positive values are clockwise, negative values are counter-clockwise.

Values of absolute value greater than 1 represent rotations that are greater than 360 degrees. The interpolation modules recognize angles such as these to allow you to make an object spin more than once with a single function call.

### `shortestOffset(from, to)`

Returns the shortest angle that can be added to `from` to yield `to`, taking into account the option of rotating either clockwise or counter-clockwise.

See the source for the rest of the API.

## /audio

### `loadAudio(state, eventCode, howlArgs)`

Example usage:

```
addHandler('load', (state) => {
    loadAudio(state, 'music', {
        src: ['./assets/music.ogg', './assets/music.mp3'],
        loop: true,
    });
});

addHandler('load_done new_game', (state) => {
    handle(state, 'music');
});

addHandler('game_over', (state) => {
    handle(state, 'music_stop');
});
```

The contents of the third argument, `howlArgs`, are passed directly to Howler.js, except for the `src` attribute, which is used by Skid to generate preloader information.

If Skid's API isn't sufficient for your purposes, you can make the abstraction leak with the `_load_done` event that corresponds to the audio to be loaded. For example:

```
addHandler('load', (state) => {
    loadAudio(state, 'music', {
        src: ['./assets/music.ogg', './assets/music.mp3'],
        loop: true,
    });
});

addHandler('music_load_done', (state, sound) => {
    // `sound` is a Howl object.
    sound.play();
});
```

Don't load audio by calling Howler.js directly because that will circumvent the preloader, thus causing it to misreport loading progress. Always use `loadAudio`.

## Interpolation

## Rendering

these sections will be documented soon
