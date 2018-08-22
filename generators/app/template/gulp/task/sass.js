module.exports = function (gulp, plugins, config, util) {

    return function (end) {
        var sass = require("gulp-ruby-sass");
        return sass("src/scss/**/*.scss")
            .on('error', sass.logError)
            .pipe(gulp.dest('src/css'));
    }
};