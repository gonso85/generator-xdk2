/**
 * Configuration module. Allow developer to specify application configuration through a json file.
 * This module depends on the configuration file `xdk.config.json` as the base.
 * Developer should define the path to this file in `amd.config.js`.
 *
 * After loaded up, get and set functions are available.
 *
 * #### Usages
 * The usage of the configuration should be specified in module's/class's API documentation:
 *
 * __NOTE__ that XDK has reserved some configuration for internal use already.
 * __Static__ - Only configuration in the configuration will be effective. e.g.
 * __Dynamic__ - Configurations set in the runtime will also be effective immediately. e.g. {@link module:ax/device/shared/InternetPoller|device:internet-poller:url}
 *
 * @module ax/config
 * @author Thomas Lee <thomas.lee@accedo.tv>
 * @example
 * // define the mapping in amd.config.js
 * // note that the actual location depends on the overall baseUrl setting
 * paths: {
 *     "xdk.config": "../xdk.config"
 * }
 *
 */
define("xdk-base/config", ["app/core/ext/xdk-base/loader/json!failover=true|xdk.config.json"], function (xdkConfig) {

    "use strict";

    var configModule, _configs = xdkConfig;

    configModule = {
        /**
         * Get configuration value if exist, otherwise return default value
         * @method get
         * @memberof module:ax/config
         * @param {String} key configuration entry key
         * @param {Object} defaultValue default value to return if the configuration entry does not exist
         * @returns {Object} If the key and value both exist, it will return the value.
         *  If the key has no value, it will return the default Value.
         *  If the key is undefined, it will return the entire config object.
         * @public
         * @function
         * @example <caption> To get the focus trail setting</caption>
         * config.get("ui.focus.enableTrail",false)
         */
        get: function (key, defaultValue) {
            if (typeof key === "undefined" || key === null) {
                return _configs;
            }
            if (_configs.hasOwnProperty(key)) {
                return _configs[key];
            }
            return defaultValue;
        },
        /**
         * Set configuration value
         * @method set
         * @memberof module:ax/config
         * @param {String} key configuration entry key
         * @param {Object} value value of the key. If value is undefined, it will remove the specific config
         * @returns {Boolean} true when successfully set but false when key or value is undefined and key is null.
         * @public
         * @function
         * @example <caption> To disable the focus trail</caption>
         * config.set("ui.focus.enableTrail",false)
         */
        set: function (key, value) {
            if (key === null || typeof key === "undefined") {
                return 0;
            }

            if (typeof value === "undefined") {
                delete _configs[key];
                return 1;
            }
            _configs[key] = value;
            return 1;
        }
    };

    return configModule;
});