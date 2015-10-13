'use strict'

var glob, write, debounce, pipeline
var babel, mochasingleprocess

module.exports = function(pipelines) {
    pipelines['build'] = [
        glob({basePath: 'src'}, '**/*.js'),
        babel({modules: 'common', optional: ['runtime']}),
        write({clobber: true}, 'lib')
    ]
    
    pipelines['build-test'] = [
        pipeline('build'),
        glob({basePath: 'test'}, '**/*.js'),
        babel({modules: 'common', optional: ['runtime'], plugins: ['babel-plugin-espower']}),
        write('lib')
    ]
    
    pipelines.test = [
        pipeline('build-test'),
        debounce(700),
        mochasingleprocess({files: 'lib/*-test.js', ui: 'qunit', growl: true, reporter: 'progress'})
    ]
}
