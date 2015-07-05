'use strict'

require('./dist/esquire')

if(process.env.NODE_ENV === 'browser') {
    module.exports = Kotlin.modules.esquire.esquire
}
else {
    module.exports = require('./dist/kotlin').modules.esquire.esquire
}
