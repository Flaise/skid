if(process.env.NODE_ENV !== 'browser') {
    // can't use var keyword or minifier shadows Kotlin variable from global scope
    global.Kotlin = require('./kotlin')
}
