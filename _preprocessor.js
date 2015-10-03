'use strict'

var babel = require("babel")

exports.process = function(source) {
    return babel.transform(source).code
}
