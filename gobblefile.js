'use strict';
const gobble = require('gobble');

module.exports = gobble('./src')
    .transform('babel', { optional: 'runtime' });
