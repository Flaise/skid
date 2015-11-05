'use strict'

module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['browserify', 'mocha'],
        
        client: {
            mocha: {ui: 'qunit'}
        },

        files: [
            'src/**/*.js',
            'test/**/*.js'
        ],
        exclude: [
        ],

        preprocessors: {
            'src/**/*.js': ['browserify'],
            'test/**/*.js': ['browserify']
        },

        browserify: {
            debug: true,
            transform: [
                ['babelify', {sourceMap: 'inline', retainLines: true,
                              optional: ['runtime'], plugins: ['babel-plugin-espower']}],
                ['browserify-istanbul', {ignore: ['**/node_modules/**', '**/test/**']}]
            ]
        },

        reporters: ['dots', 'html', 'coverage'],

        htmlReporter: {
            outputDir: 'reports/tests',
            focusOnFailures: true,
            namedFiles: true,
            urlFriendlyName: false,
        },
        coverageReporter: {
            reporters: [
                {type: 'text-summary'},
                {type: 'html', subdir: 'html'}
            ],
            dir: 'reports/coverage'
        },

        port: 9876,
        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,
        
        browsers: ['Chrome', 'Firefox'],

        singleRun: false
    })
}
