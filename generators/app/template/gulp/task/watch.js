/**
 *  Watch scss, css and index html
 */

var title = "WATCH";

module.exports = function (gulp, plugins, config, util) {

    return function (end) {
        util.startMsg(title);

        var sass = require("gulp-ruby-sass");
        var browserSync = require("browser-sync").create();

        browserSync.init({
            proxy: config.browserSyncProxy
        });

        gulp.watch("src/scss/**/*.scss", ['sass']);
        gulp.watch("src/css/*.css", function () {
            gulp.src('src/css/*.css')
                .pipe(browserSync.stream());
        });

        gulp.watch("src/js/**/*.css", function () {
            gulp.src('src/js/**/*.css')
                .pipe(browserSync.stream());
        });

        gulp.watch("src/*.html").on('change', browserSync.reload);
    };
};