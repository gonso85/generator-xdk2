/**
 *  Load a package to a specific folder
 */

var title = "ADD";

module.exports = function (gulp, plugins, config, util) {

    return function (pkg, template, to) {
        util.startMsg(title);

        if (pkg) {
            to = to || "lib";
            console.log("adding " + pkg + " to " + to);
        } else if (template) {
            to = to || "app/template";
            console.log("adding " + template + " to " + to);
        } else {
            return util.error("No package or template name.")
        }

        var name = pkg || template;

        var fs = require("fs");
        var bower = require('bower');
        var beautify = require('js-beautify').js_beautify;

        var destinationBasePath = "src/js/";
        var bowerJSONPath = __dirname + '/../../bower.json';

        var bowerJSON = JSON.parse(fs.readFileSync(bowerJSONPath, 'utf8'));
        var dependencies = bowerJSON.dependencies || {};
        var setBowerJSONBack = function () {
            bowerJSON.dependencies = dependencies;
            fs.writeFileSync(bowerJSONPath, beautify(JSON.stringify(bowerJSON)));
        };

        bowerJSON.dependencies = {};
        fs.writeFileSync(bowerJSONPath, beautify(JSON.stringify(bowerJSON)));

        return bower.commands.install([name], {}, {
                "directory": destinationBasePath + to
            })
            .on('error', function () {
                setBowerJSONBack();
                util.finishMsg(title);
            })
            .on('end', function () {
                setBowerJSONBack();
                util.finishMsg(title);
            });
    };
};