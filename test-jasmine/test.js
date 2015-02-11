'use strict'

var sanity = require('../sanity')


describe('Esquire', function() {
    beforeEach(function() {
        jasmine.clock().install()
        jasmine.clock().mockDate()
        sanity.throws = true
    })
    afterEach(function() {
        jasmine.clock().uninstall()
    })
    
    require('./is')
    require('./turns')
    require('./object-pool')
    require('./interpoland')
    require('./avatar')
})
