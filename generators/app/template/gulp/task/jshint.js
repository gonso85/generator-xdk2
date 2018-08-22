/**
 *
 * XDK CI Toolchain - Client side build - JsHint task
 */

module.exports = function (gulp, plugins, config, util) {
    var jshint = require("gulp-jshint"),
        jshintConfig = config.jshint,
        title = "JSHINT";

    jshintConfig.lookup = false;

    return function () {
        util.startMsg(title);

        return gulp.src(config.basePath + config.appJsFolder + '**/*.js')
            .pipe(jshint(jshintConfig))
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(jshint.reporter('fail'))
            .on("end", function () {
                util.finishMsg(title);
            });
    };
};