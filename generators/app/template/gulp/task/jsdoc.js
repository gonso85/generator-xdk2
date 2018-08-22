/**
 * 
 * XDK CI Toolchain - Client side build - Jsdoc task
 * @author Francisco Aranda <francisco.aranda@accedo.tv>
 * 
 */

module.exports = function (gulp, plugins, config, util) {

    var jsdoc = require("gulp-jsdoc");
    var fs = require("fs");
    var jsdocConfig = config.jsdoc;
    var jsdocTmpFile = config.gulpTempFolder + config.jsdocTmpFile;
    var _title = "JSDOC";

    var _jsdocTask = function (end) {

        //read jsdoc config, modify it if necesary, and save a temp jsdoc.conf file.
        var wstream = fs.createWriteStream(jsdocTmpFile, {
            flags: 'w',
            encoding: "utf-8",
            fd: null,
            mode: 0666
        });

        var beautify = require("js-beautify").js_beautify;
        wstream.write(beautify(JSON.stringify(jsdocConfig), {
            indent_size: 2
        }));

        wstream.end();

        var jsDocCommandArgs = {
            app: "jsdoc",
            src: config.basePath + config.appJsFolder,
            conf: jsdocTmpFile,
            dest: config.buildFolder + config.jsdocBuildFolder,
            extra: "--debug --readme ./README.md"
        };
        //get the bower dependencies list
        plugins.run(jsDocCommandArgs.app + " " + jsDocCommandArgs.src + " -r -c " + jsDocCommandArgs.conf + " -d " + jsDocCommandArgs.dest + " " + jsDocCommandArgs.extra).exec(function (err) {

            util.finishMsg(_title);
            end();

        });

    };

    return function (end) {
        util.startMsg(_title);
        _jsdocTask(end);
    }

};