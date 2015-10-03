'use strict'

var glob, write, debounce
var babel

module.exports = function(pipelines) {
    pipelines['build'] = [
        glob({basePath: 'src'}, '**/*.js'),
        debounce(500),
        babel({modules: 'common', optional: ['runtime']}),
        write({clobber: true}, 'lib')
    ]
}
