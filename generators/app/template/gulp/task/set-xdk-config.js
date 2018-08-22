/**
 *  Set XDK Config JSON file
 */

var title = "SET xdk.config.json";

var XDKConfigEnv = {
    prod: 'prod.xdk.config.json',
    dev: 'dev.xdk.config.json',
    qa: 'qa.xdk.config.json',
    demo: 'demo.xdk.config.json',
    configFolder: 'src/configs',
    destFolder: 'src/js'
};

module.exports = function (gulp, plugins, config, util) {

    return function (end) {
        util.startMsg(title);

        var appEnv = global.APP_ENV;

        if (appEnv === "default") {
            console.log("No change to xdk.config.json");
        } else {
            var rename = require('gulp-rename');
            var selectedConfigFile = XDKConfigEnv[appEnv];

            console.log("Use " + selectedConfigFile + " to replace xdk.config.json");

            gulp.src(XDKConfigEnv.configFolder + '/' + selectedConfigFile)
                .pipe(rename('xdk.config.json'))
                .pipe(gulp.dest(XDKConfigEnv.destFolder));
        }

        util.finishMsg(title);
        end();
    };
};