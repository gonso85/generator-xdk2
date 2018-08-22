/**
 *  Print help content.
 */

module.exports = function (gulp, plugins, config, util) {

    return function () {
        util.info("\nWelcome to the VDK build process.");
        util.info("To build VDK app, execute in terminal type:");
        util.info("gulp build \n");
        util.info("For more information please read the docs and isntructions at:");
        util.info("https://accedobroadband.jira.com/wiki/display/VDKCTV/Build+Tools\n");
    };
};