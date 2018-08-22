module.exports = function (gulp, plugins, config) {
    "use strict";

    var argv = require("yargs").argv,
        Server = require("karma").Server,
        path = require("path");

    function runKarma(done) {
        var debug = argv.debugMode === "true",
            opts = {
                configFile: path.resolve(config.karma.config[debug ? "unit" : "coverage"]),
                singleRun: argv.singleRun !== "false",
                browsers: [argv.browser || "PhantomJS"]
            };

        new Server(opts, done).start();
    }

    return function (done) {
        return runKarma(done);
    };
};
