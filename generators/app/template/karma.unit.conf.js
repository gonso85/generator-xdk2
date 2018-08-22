'use strict';

var shared = require('./karma.conf.js');

module.exports = function (config) {
    shared(config);

    config.set({
        reporters: ['progress', 'mocha', 'spec']
    });
};
