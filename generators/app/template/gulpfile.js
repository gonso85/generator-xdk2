'use strict';

// Global Varibles
global.APP_ENV = 'default';

// Depedencies
var argv = require('yargs').argv;
var Evt = require('events');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var util = require('./gulp/utils');
var config = require('./gulp/default.gulp.config.json');
var userConfig = require('./custom.gulp.config.json');

// Node Settings
Evt.EventEmitter.defaultMaxListeners = 0;
Evt.EventEmitter.prototype._maxListeners = 0;
process.stdin.setMaxListeners(0);
process.setMaxListeners(0);

// Config Settings
config.rootPath = process.cwd() + '/';
config.basePath = config.rootPath + config.basePath;
config = util.extend(config, userConfig);
util.setDebug(config.debug);


// Generic Error Handling
gulp.on('err', function (e) {
    util.error(e.err.stack);
});


// Tasks before gulp build
var preBuildTaskList = ['set-xdk-config', 'update-paths', 'sass', 'clean'];

if (argv.dev) {
    preBuildTaskList.unshift('use-dev');
}
if (argv.demo) {
    preBuildTaskList.unshift('use-demo');
}
if (argv.prod) {
    preBuildTaskList.unshift('use-prod');
}
if (argv.qa) {
    preBuildTaskList.unshift('use-qa');
}

/*
 *
 * Gulp Tasks
 *
 */

/**
 * Build the app into a zip file with different xdk.config.json settings
 * You can configure different config files under src/configs/ folder
 *
 * @example gulp build
 *          gulp build --dev
 *          gulp build --demo
 *          gulp build --prod
 *          gulp build --qa
 *
 * You can also build the app without minifying the JS files in debug mode
 * @example gulp build -d
 *          gulp build -debug
 */
gulp.task('build', preBuildTaskList, require('./gulp/task/build')(gulp, plugins, config, util));

// Delete all files inside /build/optimized/
gulp.task('clean', require('./gulp/task/clean')(gulp, plugins, config, util));

// The command "gulp" will fire the default gulp task,
// here the default one is the help task, it will show available tasks
gulp.task('default', require('./gulp/task/help')(gulp, plugins, config, util));

// Show available tasks
gulp.task('help', require('./gulp/task/help')(gulp, plugins, config, util));

// Install dependencies declared in bower.json under the root folder
gulp.task('install', require('./gulp/task/install')(gulp, plugins, config, util));

// Run jshint checking for src/js
gulp.task('jshint', require('./gulp/task/jshint')(gulp, plugins, config, util));

// Replace the src/js/xdk.config.json with the current environment config
gulp.task('set-xdk-config', require('./gulp/task/set-xdk-config')(gulp, plugins, config, util));

// Update the amd path after gulp install is finished
gulp.task('update-paths', require('./gulp/task/update-paths')(gulp, plugins, config, util));

// Convert the sass files into css files for one time
gulp.task('sass', require('./gulp/task/sass')(gulp, plugins, config, util));

// Keep watching the changes of sass files, convert them into css files,
// and inject the css to browser without refreshing.
gulp.task('watch', require('./gulp/task/watch')(gulp, plugins, config, util));

// Keep watching the changes of sass files, and convert them into css files
gulp.task('sass:watch', function () {
    gulp.watch('src/scss/**/*.scss', ['sass']);
});

// Run all unit tests inside test folder
gulp.task('test', require('./gulp/task/test')(gulp, plugins, config, util));

// Set the global environment for gulp tasks, you can use this in your own gulp tasks
gulp.task('use-demo', function () {
    global.APP_ENV = 'demo';
});
gulp.task('use-dev', function () {
    global.APP_ENV = 'dev';
});
gulp.task('use-prod', function () {
    global.APP_ENV = 'prod';
});
gulp.task('use-qa', function () {
    global.APP_ENV = 'qa';
});

// Gulp Tasks with parameters
var gulpWithParam = require('gulp-param')(require('gulp'), process.argv);

/**
 * Load a package to a default folder or a specific folder
 *
 * @example gulp add --pkg jquery --to myLib/js
 *          gulp add --pkg jquery
 *          gulp add --template vdk-tml-multi-carousel
 */
gulpWithParam.task('add', require('./gulp/task/add')(gulpWithParam, plugins, config, util));

/**
 * Create a new controller + view or create a new class
 *
 * @example gulp new --template home
 *          gulp new --klass app/wgt/SuperHero
 *          gulp new --klass app/wgt/FancyButton --extend xdk-ui-basic/Button
 */
gulpWithParam.task('new', require('./gulp/task/new')(gulpWithParam, plugins, config, util));
