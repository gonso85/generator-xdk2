/* global readFile: true */
/**
 * A JSON loader plugin that is responsible to load JSON files.
 * Parameters can be specified in the definition separated using pipe character (|) to control the load. Configurable behaviors include failover and timeout.
 * To enable failover, specify failover=true. To define a timeout period other than the default (8 seconds), use waitSeconds=[number-of-seconds].
 * @module json
 * @example
 * // load a local json file
 * require(["json!app/config.json"], function (config) {
 *     // utilize the config
 *     console.log(config.ovpApi);
 * });
 *
 * // load an external json file
 * // amd.config.js
 * require({
 *     baseUrl: "js/",
 *     paths: {
 *         remote: "http://xdk.demo.accedo.tv/test"
 *     }
 * });
 *
 * // in app
 * // the location will be resolved as http://xdk.demo.accedo.tv/test/config.json
 * require(["json!remote/config.json"], function (config) {
 *     // utilize the config
 *     console.log(config.ovpApi);
 * });
 *
 *
 * // allowing failover (return empty object instead of throw exception)
 * require(["json!failover=true|remote/config.json"], function (config) {
 *     // give us {} if remote/config.json does not exist
 *     console.log(config); // {}
 * });
 *
 * // allowing failover (return empty object instead of throw exception)
 * require(["json!waitSeconds=4|remote/config.json"], function (config) {
 *     // will be invoked if can be loaded
 * }, function (reason) {
 *     // will be invoked after 4 seconds timeout
 * });
 *
 * // multiple parameters, in a format of query string
 * require(["json!failover=true&waitSeconds=4|remote/config.json"], function (config) {
 *     // give us {} if remote/config.json does not exist
 * }, function (reason) {
 *     // will be invoked after 4 seconds timeout
 * });
 */
define("app/core/ext/xdk-base/loader/json", ["xdk-base/util", "xdk-base/QueryString", "lib/jsonminify"], function (util, QueryString) {

    "use strict";

    var exports = {
            /**
             * If the plugin has a dynamic property set to true, then it means
             * the loader MUST NOT cache the value of a normalized plugin dependency,
             * instead call the plugin's load method for each instance of a plugin dependency.
             * @property {Boolean} dynamic
             * @memberof module:json
             */
            dynamic: false
        },

        // regex for string representing network resource
        REGEX_IS_EXTERNAL = /^(\/\/)|([^:]+:\/\/)/,

        // delimiter for loader parameter
        PARAM_DELIMITER = "|",

        // dummy function
        DUMMY_FUNCTION = function () {},

        // timeout period
        waitSeconds = 8,

        // template for module definition
        MODULE_ID_PLACEHOLDER = "%MODULE_ID%",
        MODULE_CONTENT_PLACEHOLDER = "%MODULE_CONTENT%",
        DEFINE_TEMPLATE = "define('" + MODULE_ID_PLACEHOLDER + "'," + MODULE_CONTENT_PLACEHOLDER + ")",

        // build config
        configuration = {},

        // loaded json
        jsonContent = {};


    /**
     * Get a valid transport object for ajax request.
     * @method
     * @private
     * @returns {Object} The transport object
     * @memberof module:json
     */
    function getTransport() {
        return new XMLHttpRequest();
    }

    /**
     * Read file content, and store it in a map.
     * This function assumes the running environment is Rhino.
     * @method
     * @private
     * @param {String} path The file path
     * @memberof module:json
     */
    function readFileContent(path) {
        // for rhino
        return readFile(path);
    }

    /**
     * Get a valid transport object for ajax request.
     * @method
     * @private
     * @param {String} responseText The response text from the XmlHttpRequest
     * @returns {Object} The transport object
     * @memberof module:json
     */
    function parseResponse(responseText) {
        // util.parse is always available after loading ax/util
        return util.parse(JSON.minify(responseText));
    }

    /**
     * Check if the resource url should be skipped from optimization.
     * @method
     * @private
     * @param {Object} obj The object to test
     * @returns {Boolean} True if the object is a function, false otherwise
     * @memberof module:json
     */
    function shouldResourceSkipped(resourceUrl) {
        // the path is mapped to an empty file OR is an external resource
        return resourceUrl.indexOf("empty:") === 0 || REGEX_IS_EXTERNAL.test(resourceUrl);
    }

    /**
     * Execute the onFailure function if it is a valid function.
     * @method
     * @private
     * @param {Object} onSuccess The onSuccess callback
     * @param {Object} onFailure The onFailure object
     * @param {Object} arg The argument for the onFailure function
     * @param {Object} loadOption The loading option
     * @memberof module:json
     */
    function handleFailure(onSuccess, onFailure, arg, loadOption) {
        loadOption = loadOption || {};

        if (loadOption.failover) {
            onSuccess({});
            return;
        }

        onFailure(arg);
    }

    /**
     * Handle the response text from XmlHttpRequest.
     * @method
     * @private
     * @param {String} responseText The response text from the XmlHttpRequest
     * @param {Function} onSuccess The callback for success case
     * @param {Function} onFailure The callback for failure case
     * @param {Object} loadOption The loading option
     * @returns {Object} The transport object
     * @memberof module:json
     */
    function handleResponse(responseText, onSuccess, onFailure, loadOption) {
        try {
            onSuccess(parseResponse(responseText));
        } catch (e) {
            // response is not a valid JSON
            handleFailure(onSuccess, onFailure, e, loadOption);
        }
    }

    /**
     * Resolve resource id to a url that can be loaded directly.
     * Only non-external resource should be resolved using require.toUrl.
     * .json extension will be added after resolve (if necessary).
     * @method
     * @private
     * @param {String} resourceId The resource id
     * @param {Object} require The require object from the amd core
     * @returns {String} The resource url after resolve
     * @memberof module:json
     */
    function resolveResourceUrl(resourceId, require) {
        // only resolve non-external resource
        if (REGEX_IS_EXTERNAL.test(resourceId)) {
            return resourceId;
        }

        return require.toUrl(resourceId);
    }

    /**
     * Parse the "resource id", get the failover config and the real resource id from it.
     * @method
     * @private
     * @param {String} resourceId The resource id
     * @returns {Object} The parsed object, containing the resource id and the parameters
     * @memberof module:json
     */
    function parseResourceId(resourceId) {
        var tokens = resourceId.split(PARAM_DELIMITER),
            param;

        // no delimiter in the resource id, no more process
        if (tokens.length === 1) {
            return {
                id: resourceId,
                failover: false,
                waitSeconds: waitSeconds
            };
        }

        param = parseLoadingOption(tokens[0]);

        return util.extend({
            id: tokens[1]
        }, param);
    }

    /**
     * Parse the loading option.
     * @method
     * @private
     * @param {String} queryString The parameter list in the loader dependency
     * @returns {Object} The parsed object, containing 2 properties: failover (Boolean) and waitSeconds (Number)
     * @memberof module:json
     */
    function parseLoadingOption(queryString) {
        var param = QueryString.parse(queryString);

        param.failover = param.failover === "true";

        // parse waitSeconds
        param.waitSeconds = parseInt(param.waitSeconds, 10);
        if (isNaN(param.waitSeconds)) {
            param.waitSeconds = waitSeconds;
        }

        return param;
    }

    /**
     * Load the required JSON file.
     * The onSuccess callback will be executed after the file is successfully loaded.
     * The onFailure callback will be executed if the file cannot be loaded.
     * @method
     * @private
     * @param {String} path The file path
     * @param {Function} onSuccess The callback for success case
     * @param {Function} onFailure The callback for failure case
     * @param {Object} loadOption The loading option
     * @memberof module:json
     */
    function loadJsonFile(path, onSuccess, onFailure, loadOption) {
        var xhr = getTransport();

        xhr.onload = xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }

            xhr.onload = xhr.onreadystatechange = null;

            var statusCode = xhr.status;

            if (statusCode === 0 || (statusCode >= 200 && statusCode < 300) || statusCode === 304) {
                handleResponse(xhr.responseText, onSuccess, onFailure, loadOption);
            } else {
                handleFailure(onSuccess, onFailure, xhr, loadOption);
            }
        };

        // set up a timeout
        xhr.timeout = (loadOption.waitSeconds || waitSeconds) * 1000;
        xhr.ontimeout = function () {
            handleFailure(onSuccess, onFailure, "Loading " + path + " timeout.", loadOption);
        };

        // send AJAX request to get the JSON
        xhr.open("GET", path);
        xhr.send();
    }

    /**
     * A function to normalize the passed-in resource ID.
     * Normalization of an module ID normally means converting relative paths, like './some/path' or '../another/path' to be non-relative, absolute IDs.
     * This is useful in providing optimal caching and optimization, but it only needs to be implemented if:
     * - the resource IDs have complex normalization
     * - only needed if the resource name is not a module name.
     * If the plugin does not implement normalize then the loader will assume it is something like a regular module ID and try to normalize it.
     * @method
     * @param {String} resourceId The resource ID that the plugin should load.
     * @param {Function} normalize A normalization function that accepts a string ID to normalize using the standard relative module normalization rules using the loader's current configuration.
     * @returns {String} The normalized resource id
     * @memberof module:json
     */
    exports.normalize = function (resourceId, normalize) {
        var tokens = resourceId.split(PARAM_DELIMITER);

        // no delimiter in the resource id, no more process
        if (tokens.length === 1) {
            return normalize(resourceId);
        }

        return tokens[0] + PARAM_DELIMITER + normalize(tokens[1]);
    };

    /**
     * Load resource for build process.
     * @method
     * @private
     * @param {String} resourceId The resource ID that the plugin should load.
     * @param {Function} require A local require function to use to load other modules. This require function has some utilities on it:
     *  * require.toUrl("moduleId+extension"). See the require.toUrl API notes for more information.
     * @param {Function} onLoad A function to call once the value of the resource ID has been determined. This tells the loader that the plugin is done loading the resource.
     * @param {Object} [config] A configuration object. This is a way for the optimizer and the web app to pass configuration information to the plugin. An optimization tool may set an isBuild property in the config to true if this plugin (or pluginBuilder (TODOC)) is being called as part of an optimizer build.
     * @memberof module:json
     */
    function loadForBuild(resourceId, require, onLoad, config) {
        var loadOption = parseResourceId(resourceId),
            resourceUrl = resolveResourceUrl(loadOption.id, require);

        if (shouldResourceSkipped(resourceId) || shouldResourceSkipped(resourceUrl)) {
            onLoad();
            return;
        }

        // store the config for later use (namespace, dir, etc.)
        configuration = config;

        // load file
        jsonContent[resourceId] = readFileContent(resourceUrl);
        onLoad(jsonContent);
    }

    /**
     * Load resource for application run time.
     * @method
     * @private
     * @param {String} resourceId The resource ID that the plugin should load.
     * @param {Function} require A local require function to use to load other modules. This require function has some utilities on it:
     *  * require.toUrl("moduleId+extension"). See the require.toUrl API notes for more information.
     * @param {Function} onLoad A function to call once the value of the resource ID has been determined. This tells the loader that the plugin is done loading the resource.
     * @param {Object} [config] A configuration object. This is a way for the optimizer and the web app to pass configuration information to the plugin. An optimization tool may set an isBuild property in the config to true if this plugin (or pluginBuilder (TODOC)) is being called as part of an optimizer build.
     * @memberof module:json
     */
    function loadForApp(resourceId, require, onLoad, config) {
        var onFailure = config ? (util.isFunction(config.onFailure) ? config.onFailure : DUMMY_FUNCTION) : DUMMY_FUNCTION,
            loadOption = parseResourceId(resourceId);

        // load the JSON file
        loadJsonFile(resolveResourceUrl(loadOption.id, require), onLoad, onFailure, loadOption);
    }

    /**
     * Load a resource.
     * Assuming the resource IDs do not need special ID normalization.
     * @method
     * @param {String} resourceId The resource ID that the plugin should load.
     * @param {Function} require A local require function to use to load other modules. This require function has some utilities on it:
     *  * require.toUrl("moduleId+extension"). See the require.toUrl API notes for more information.
     * @param {Function} onLoad A function to call once the value of the resource ID has been determined. This tells the loader that the plugin is done loading the resource.
     * @param {Object} [config] A configuration object. This is a way for the optimizer and the web app to pass configuration information to the plugin. An optimization tool may set an isBuild property in the config to true if this plugin (or pluginBuilder (TODOC)) is being called as part of an optimizer build.
     * @memberof module:json
     */
    exports.load = function (resourceId, require, onLoad, config) {
        if (config.isBuild) {
            loadForBuild(resourceId, require, onLoad, config);
        } else {
            loadForApp(resourceId, require, onLoad, config);
        }
    };

    /**
     * Function being called by r.js when a module is parsed.
     * In this implementation a __json!name__ module is inserted into the output file.
     * By this, the amd module will not request these json modules in runtime.
     * @see {@link http://requirejs.org/docs/plugins.html#apiwrite}
     * @param {String} pluginName The plugin name
     * @param {String} name The module name
     * @param {Function} write A function to write to the output file
     * @memberof module:json
     */
    exports.write = function (pluginName, name, write) {
        if (shouldResourceSkipped(name) || !jsonContent[name]) {
            return;
        }

        var moduleName = pluginName + "!" + name,
            definePrefix = configuration.namespace ? (configuration.namespace + ".") : "",
            moduleDefinition;

        moduleDefinition = DEFINE_TEMPLATE.replace(MODULE_ID_PLACEHOLDER, moduleName)
            .replace(MODULE_CONTENT_PLACEHOLDER, jsonContent[name]);

        write.asModule(moduleName, definePrefix + moduleDefinition);
    };


    return exports;

});