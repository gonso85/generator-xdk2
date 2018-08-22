/**
 * A wrapper of the bower install
 */

var title = 'INSTALL';

module.exports = function (gulp, plugins, config, util) {

    var collect = function () {
        var request = require('request');

        var postRawData = function () {
            request.post({
                url: config.statsBaseUrl + '/event/install',
                json: {
                    'bowerConfig': util.getJson('bower.json', {})
                },
                headers: {
                    'X-App-Name': util.getJson('src/js/xdk.config.json', {})['app.name'] || 'unknown'
                }
            });
        };

        request.get({
            url: config.statsBaseUrl + '/status'
        }, function (err, res, body) {
            if (err || body.toLowerCase() !== 'on') {
                return;
            }

            postRawData();
        });
    };

    return function (end) {
        util.startMsg(title);
        console.log('Installing JS packages declared in bower.json...');

        var bower = require('bower');
        var runSequence = require('run-sequence').use(gulp);

        bower.commands.install().on('error', function (err) {
            console.log(err);
        }).on('end', function (results) {
            util.finishMsg(title);
            runSequence('update-paths'); // call gulp task to update paths
            end();
            collect();
        });
    };
};
