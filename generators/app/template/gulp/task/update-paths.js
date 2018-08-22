/**
 *
 * XDK CI Toolchain - Client side build - Update AMD Paths from list of installed xdk bower modules
 * @author Francisco Aranda <francisco.aranda@accedo.tv>
 *
 */

module.exports = function (gulp, plugins, config, util) {

    var _title = "UPDATE AMD PATHS FROM INSTALLED BOWER MODULES";

    var createDirectory = function (dir) {
        var fs = require("fs");

        try {
            fs.mkdirSync(dir);
        } catch (e) {
            if (e.code !== 'EEXIST') {
                console.log(e);
            }
        }
    };

    return function (end) {

        util.startMsg(_title);

        var fs = require("fs");
        var Lazy = require("lazy");
        var jeditor = require("gulp-json-editor");
        var exec = require('child_process').exec;

        var tmpFolder = config.gulpTempFolder;
        var app = "bower";
        var command = "list -p";
        var depPreFix = "../";
        var depFile = config.basePath + config.depFolder + "dep.config.js";

        util.info("Be patient, this process could take around 30 seconds...");
        exec(app + " " + command, function (err, stdout, stderr) {
            if (err) {
                throw "Bower executable couldn't be found, please install it with 'npm install bower -g'";
            }

            var fileContent = "{" + stdout + "}";
            commandCallback(eval("(" + fileContent + ")"));
        });

        //read the amd paths file
        var commandCallback = function (list) {
            var beautify = require('js-beautify').js_beautify;
            var header = "require({\"paths\":";
            var footer = "});"



            try {
                var fd = fs.openSync(depFile, "r");
                fs.closeSync(fd);
            } catch (e) {
                createDirectory(config.basePath + config.depFolder);
                fs.writeFileSync(depFile, beautify(header + "{}" + footer, {
                    indent_size: 2
                }));
            }

            var count = 0;

            var amdConfigFile = new Lazy(fs.createReadStream(depFile));

            amdConfigFile.lines.forEach(function (l) {
                count++;
            });

            var output = "";
            amdConfigFile.lines.forEach(function (l) {
                output += l;
            }).join(function () {

                if (output) {
                    var re = /\:.*\{(.*)\}/;
                    output = output.replace(/ /g, '');
                    var m = re.exec(output);
                    output = m[1];
                }

                var wstream = fs.createWriteStream(depFile, {
                    flags: 'w',
                    encoding: "utf-8",
                    fd: null,
                    mode: 0666
                });

                var outputJson = eval("({" + output + "})");

                var finaljson = {};

                for (var modulename in list) {
                    finaljson[modulename] = depPreFix + list[modulename].replace("src/", "");
                    //TODO: read internal module dependencies, adding them to the package.json file
                }
                for (var modulename in outputJson) {
                    finaljson[modulename] = outputJson[modulename];
                }

                var defaultPaths = config.loaderPaths;

                for (var module in defaultPaths) {
                    finaljson[module] = defaultPaths[module];
                }


                wstream.write(beautify(header + JSON.stringify(finaljson) + footer, {
                    indent_size: 2
                }));
                wstream.end();
                util.finishMsg(_title);
                end();

            });

        }
    };
};