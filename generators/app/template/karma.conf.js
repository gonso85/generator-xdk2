'use strict';

module.exports = function (config) {
    config.set({
        singleRun: false,
        browsers: ['Chrome'],
        frameworks: ['mocha', 'chai-as-promised', 'chai'],
        reporters: ['progress', 'coverage', 'mocha', 'spec'],
        files: [
            'node_modules/requirejs/require.js',
            'src/dep/xdk-base/domReady.js',
            'src/dep/xdk-base/amd.js',
            'src/dep/dep.config.js',
            'src/js/amd.config.js',
            'src/dep/xdk-base/loader/css.js',
            'src/js/app.js',
            { pattern: 'src/**', served: true, included: false, watched: false },
            'test/config.js',
            'test/src/js/**'
        ],

        proxies: {
            '/src/': '/base/src/',
            '/test/': '/base/test/'
        },

        phantomjsLauncher: {
            debug: true
        },

        client: {
            captureConsole: false,
            mocha: {
                timeout: '35000',
                reporter: 'html'
            }
        },

        mochaReporter: {
            colors: {
                success: 'green',
                info: 'blue',
                warning: 'cyan',
                error: 'bgRed'
            },
            symbols: {
                success: '+',
                info: '#',
                warning: '!',
                error: 'x'
            }
        }
    });
};
