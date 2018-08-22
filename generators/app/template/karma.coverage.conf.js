'use strict';

var shared = require('./karma.conf.js');

module.exports = function (config) {
    shared(config);

    config.set({
        preprocessors: {
              // source files, that you wanna generate coverage for
              // do not include tests or libraries
            'src/!(dep)/**/*.js': ['coverage']
        },

        coverageReporter: {
            dir: 'coverage/',
            reporters: [{
                type: 'lcov',
                subdir: 'report-lcov'
            }, {
                type: 'html',
                subdir: 'report-html'
            }, {
                // don't include filename so it will be displayed in console
                type: 'text'
            }, {
                // don't include filename so it will be displayed in console
                type: 'text-summary'
            }]
        }
    });
};
