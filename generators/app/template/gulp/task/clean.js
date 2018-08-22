/**
 *
 * XDK CI Toolchain - Client side build - Clean Task
 * @author Francisco Aranda <francisco.aranda@accedo.tv>
 *
 */

module.exports = function (gulp, plugins, config, util) {

    var del = require('del');
    var _title = "CLEAN";

    return function (end) {
        util.startMsg(_title);
        del.sync(['./build/optimized/**']);
        util.finishMsg(_title);
        end();
    }
};