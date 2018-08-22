/**
 *
 * XDK CI Toolchain - Client side build - General Utils
 * @author Francisco Aranda <francisco.aranda@accedo.tv>
 *
 */

'use strict';

var fs = require('fs');

require('colors');

module.exports = {

    __debug: false,

    setDebug: function (debug) {
        this.__debug = debug;
    },

    CONSTANTS: {
        LOG: "LOG: ",
        DEBUG: "DEBUG: ",
        ERROR: "ERROR: "
    },

    logo: function () {
        console.log("\n");
        console.log("      ██╗  ██╗██████╗ ██╗  ██╗     ".green);
        console.log("      ╚██╗██╔╝██╔══██╗██║ ██╔╝     ".green);
        console.log("       ╚███╔╝ ██║  ██║█████╔╝      ".green);
        console.log("       ██╔██╗ ██║  ██║██╔═██╗      ".green);
        console.log("      ██╔╝ ██╗██████╔╝██║  ██╗     ".green);
        console.log("      ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝     \n".green);
        console.log(" XDK Continous Integration Toolcahin ".green);
        console.log("========Client Side Build Tools=======\n".green);
        console.log("            For XDK 2.5+           \n");
        console.log("For more information please read the docs and isntructions at:");
        console.log("https://accedobroadband.jira.com/wiki/display/XDKDEV/New+CI+Tools+Chain\n".blue);
        console.log("@farandal <francisco.aranda@accedo.tv>");
        console.log("\n");
    },

    rainbow: function (msg) {
        console.log("\n");
        console.log(msg.rainbow);
        console.log("\n");
    },

    startMsg: function (msg) {
        console.log("\n");
        console.log("╔██████════| START  ".green + msg.green + " |════██████╗".green);
        console.log("\n");
    },

    finishMsg: function (msg) {
        console.log("\n");
        console.log("╚██████════| FINISH ".green + msg.green + " |════██████╝".green);
        console.log("\n");
    },


    info: function (msg) {
        console.log(
            msg.green
        );
    },

    log: function (msg) {
        console.log(
            this.CONSTANTS.LOG + msg
        );
    },

    debug: function (msg) {
        if (!this.__debug) {
            return;
        }
        console.log(
            this.CONSTANTS.DEBUG.grey + msg.grey
        );
    },

    error: function (msg) {
        msg = msg || ""
        console.log(
            this.CONSTANTS.ERROR.red + msg.red
        );
    },

    mkdir: function (path) {
        try {
            fs.mkdirSync(path);
        } catch (e) {
            if (e.code != 'EEXIST') throw e;
        }
    },

    fail: function (err) {
        console.log(
            this.CONSTANTS.ERROR.red + err.red
        );

    },

    progress: function (progress) {
        console.log(
            this.CONSTANTS.DEBUG.blue + progress.blue
        );
    },

    deleteFolderRecursive: function (path) {
        var self = this;
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    self.deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },

    deleteFolderContentsRecursive: function (path) {
        var self = this;
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    self.deleteFolderContentsRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
        }
    },

    clone: function (obj) {
        var self = this;

        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        var temp = obj.constructor();
        for (var key in obj) {
            temp[key] = self.clone(obj[key]);
        }

        return temp;
    },

    escapeRegExp: function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },

    getJson: function (file, defaultValue) {
        var rs = {};
        try {
            rs = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (e) {
            if (defaultValue) {
                return defaultValue;
            }

            this.error("Not able to find " + file);
        }

        return rs;
    },

    extend: function (target, source) {
        var _ = require("underscore");
        for (var prop in source)
            if (prop in target)
                _.extend(target[prop], source[prop]);
            else
                target[prop] = source[prop];
        return target;
    },

    /**
     * Get list of javascript or css from comments blocks in the html file
     * @param  {String} source   HTML source
     * @param  {String} code   HTML Input
     * @param  {String} prefix [description]
     * @return {Array}         List of the javascript and css files
     */
    getSources: function (source, code, prefix) {
        var htmlparser = require("htmlparser2"),
            list = [],
            regexp = new RegExp("<!--\\s*build:" + code + "\\s*-->((.|\\n)*?)<!--\\s*endbuild\\s*-->", "ig"),

            m = regexp.exec(source),
            parser = new htmlparser.Parser({
                onopentag: function (name, attribs) {
                    if (attribs.type === "text/css") {
                        list.push(prefix + attribs.href);
                    } else if (attribs.src) {
                        list.push(prefix + attribs.src);
                    }
                }
            }, {
                decodeEntities: true
            });

        if (m && m[0]) {
            parser.write(m[0]);
            parser.end();
        }

        this.info(code + " => " + JSON.stringify(list));
        return list;
    },

    getTime: function () {
        var curTime = new Date();

        function pad2(n) {
            return (n < 10 ? '0' : '') + n;
        }

        return curTime.getFullYear() +
            pad2(curTime.getMonth() + 1) +
            pad2(curTime.getDate()) +
            "T" +
            pad2(curTime.getHours()) +
            pad2(curTime.getMinutes()) +
            pad2(curTime.getSeconds());
    }
};
