/**
 *
 * XDK CI Toolchain - Client side build - Build Task
 *
 */
module.exports = function (gulp, plugins, config, util) {

    var argv = require("yargs").argv,
        fs = require("fs"),
        concatCss = require("gulp-concat-css"),
        del = require("del"),
        htmlReplace = require("gulp-html-replace"),
        htmlMin = require("gulp-htmlmin"),
        minifyCss = require("gulp-minify-css"),
        mkdirp = require('mkdirp'),
        requirejs = require('requirejs'),
        zip = require('gulp-zip');

    var title = "BUILD",
        _end,
        appPackageName,
        optimizedPath = config.buildFolder + config.optimizedFolder,
        distributionPath = config.buildFolder + config.distributionsFolder;

    var prepareDirectories = function () {
        util.debug("Prepare directories");

        mkdirp(optimizedPath, function (err) {
            if (err) {
                util.error("creating " + optimizedPath);
                return;
            }
            mkdirp(optimizedPath + "js", function (err) {
                if (err) {
                    util.error("creating " + optimizedPath + "js");
                    return;
                }
                mkdirp(optimizedPath + "css", function (err) {
                    if (err) {
                        util.error("creating " + optimizedPath + "css");
                        return;
                    }
                    requireJsOptimisation();
                });
            });
        });
    };

    var requireJsOptimisation = function () {
        util.debug("RequireJs Started");

        var requireJsSettings = config.requirejs,
            imgMapFile = config.basePath + config.depFolder + "img.map.js",
            origImageMap;

        if (argv.debug || argv.d) {
            requireJsSettings.optimize = "none";
        }

        try {
            origImageMap = fs.readFileSync(imgMapFile, 'utf8');
        } catch (e) {
            origImageMap = 'require({"image":{"map":{"../img":[]}}})';
            fs.writeFileSync(imgMapFile, origImageMap);
        }

        util.debug("Starting R.js Build with config:");
        util.debug(JSON.stringify(requireJsSettings));

        //call require js optimize
        //here is a workaround
        //for the first time running requirejs.optimize, the xdk-base/builder/imageBuider
        //will run as a plugin to generate the image mapping file img.map.js after all files
        //are optimized.
        //for the second time running requirejs.optimize, the new img.map.js will be included
        //in the optimized file.
        requirejs.optimize(requireJsSettings, function () {
            var optimizationEnd = function () {
                    util.debug("RequireJs Finished");
                    generateBuild();
                },
                newImageMap = fs.readFileSync(imgMapFile, 'utf8');

            // If the image map is not updated, no need the second round of RequireJS
            if (origImageMap === newImageMap) {
                optimizationEnd();
                return;
            }

            requirejs.optimize(requireJsSettings, function () {
                optimizationEnd();
            });
        });
    };

    var generateBuild = function () {
        function prepareDistFiles() {
            gulp.src(config.distIncludes)
                .pipe(gulp.dest(optimizedPath))
                .on("end", generateCss);
        }

        function generateCss() {
            var htmlSource = fs.readFileSync(config.basePath + "index.html", "utf8").replace(/([\r\n])/gm, "");
            gulp.src(util.getSources(htmlSource, "css", config.basePath))
                .pipe(concatCss('app.css'))
                .pipe(gulp.dest(optimizedPath + "css/"))
                .on("end", function () {
                    gulp.src(optimizedPath + "css/*")
                        .pipe(concatCss("app.min.css"))
                        .pipe(minifyCss())
                        .pipe(gulp.dest(config.rootPath + optimizedPath + "css/"))
                        .on("end", function () {
                            del.sync(optimizedPath + "css/app.css");
                            processHTML();
                        });
                });
        }

        function processHTML() {
            gulp.src(optimizedPath + 'index.html')
                .pipe(htmlReplace({
                    'js': "js/app.min.js",
                    'css': "css/app.min.css"
                }))
                .pipe(htmlMin({
                    removeComments: !(argv.debug || argv.d),
                    collapseWhitespace: !(argv.debug || argv.d)
                }))
                .pipe(gulp.dest(optimizedPath))
                .on("end", generateDistribution);
        }

        util.debug("Start Generating Build");
        prepareDistFiles();
    };

    var generateDistribution = function () {
        var xdkConfig = util.getJson(config.basePath + config.appJsFolder + "xdk.config.json"),
            time = util.getTime();

        appPackageName = xdkConfig["app.name"] + "_" + xdkConfig["version"] + "_" + time + ".zip";

        gulp.src(optimizedPath + "**/*")
            .pipe(zip(appPackageName))
            .pipe(gulp.dest(distributionPath))
            .on("end", endTask);
    };

    var collect = function () {
        var request = require('request');

        function postRawData() {
            var directoryMap = require("gulp-directory-map");

            gulp.src(['src/**/*.js', 'src/**/*.html', 'src/**/*.json', '!src/dep/**/*.*'])
                .pipe(directoryMap({
                    filename: 'structure.json'
                }))
                .pipe(gulp.dest('gulp/temp'))
                .on("end", function () {
                    var xdkConfig = util.getJson('src/js/xdk.config.json', {});

                    var data = {
                        "xdkConfig": xdkConfig,
                        "structure": util.getJson('gulp/temp/structure.json', {})
                    };

                    var del = require('del');
                    del.sync('gulp/temp/structure.json');

                    request.post({
                        url: config.statsBaseUrl + '/event/build',
                        json: data,
                        headers: {
                            'X-App-Name': xdkConfig["app.name"] || "unknown"
                        }
                    });
                });
        }

        request.get({
            url: config.statsBaseUrl + '/status'
        }, function (err, res, body) {
            if (err || body.toLowerCase() !== "on") {
                return;
            }
            postRawData();
        });
    };

    var endTask = function () {
        util.rainbow("███████████████████████████████████████████████████");
        util.log("Distribution created: " + distributionPath + appPackageName);
        util.log("Optimized version generated under: " + optimizedPath);
        util.rainbow("███████████████████████████████████████████████████");
        util.finishMsg(title);
        _end();
        collect();
    };

    return function (end) {
        _end = end;
        util.startMsg(title);
        //Start the build process from prepareDirectories
        prepareDirectories();
    };
};
