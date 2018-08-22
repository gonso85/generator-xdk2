/**
 * Error handling for VDK
 * @class vdk/errors/VIAError
 * @example
 *      new VIAError(VIAError.FACILITY.CONFIGURATION_SERVICE, VIAError.ERROR.NOT_FOUND, 'a custom error message');
 * @fires vdk/errors/VIAError.Event.ErrorOccurred
 * @augments Error
 * @author Shawn Zeng <shawn.zeng@accedo.tv>
 */
define("vdk/errors/VIAError", [
    "xdk-ax/mediator",
    "xdk-base/class",
    "xdk-base/config",
    "vdk/errors/LocalErrorConfig"
], function (
    mediator,
    klass,
    config,
    LocalErrorConfig
) {

    var VIAError = klass.create(Error, {

            /**
             * VIAError Events
             * @type {object}
             * @public
             * @memberof vdk/errors/VIAError
             * @static
             */
            Event: {
                /**
                 * Error occurred
                 * @event vdk/errors/VIAError.Event.ErrorOccurred
                 * @type {string}
                 */
                ErrorOccurred: "VIAErrorEvent:ErrorOccurred"
            },

            /**
             * Available facilities of Error
             * @name FACILITY
             * @type {object}
             * @public
             * @memberof vdk/errors/VIAError
             * @static
             */
            FACILITY: {

                /**
                 * Configuration service
                 * @name CONFIGURATION_SERVICE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                CONFIGURATION_SERVICE: "CONFIGURATION_SERVICE",

                /**
                 * User settings service
                 * @name USER_SETTINGS_SERVICE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                USER_SETTINGS_SERVICE: "USER_SETTINGS_SERVICE",

                /**
                 * Analytics service
                 * @name ANALYTICS_SERVICE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                ANALYTICS_SERVICE: "ANALYTICS_SERVICE",

                /**
                 * Status service
                 * @name STATUS_SERVICE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                STATUS_SERVICE: "STATUS_SERVICE",

                /**
                 * Resource service
                 * @name RESOURCE_SERVICE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                RESOURCE_SERVICE: "RESOURCE_SERVICE",

                /**
                 * Log service
                 * @name LOG_SERVICE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                LOG_SERVICE: "LOG_SERVICE",

                /**
                 * Content service
                 * @name CONTENT_SERVICE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                CONTENT_SERVICE: "CONTENT_SERVICE",

                /**
                 * Playback service
                 * @name PLAYBACK_SERVICE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                PLAYBACK_SERVICE: "PLAYBACK_SERVICE",

                /**
                 * Authentication service
                 * @name AUTHENTICATION_SERVICE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                AUTHENTICATION_SERVICE: "AUTHENTICATION_SERVICE",

                /**
                 * User manager
                 * @name USER_MANAGER
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                USER_MANAGER: "USER_MANAGER",

                /**
                 * General
                 * @name GENERAL
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.FACILITY
                 * @static
                 */
                GENERAL: "GENERAL"
            },

            /**
             * Available errors of VIA Error
             * @name ERROR
             * @type {object}
             * @public
             * @memberof vdk/errors/VIAError
             * @static
             */
            ERROR: {

                /**
                 * Requested item has not been found
                 * @name NOT_FOUND
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.ERROR
                 * @static
                 */
                NOT_FOUND: "NOT_FOUND",

                /**
                 * Network problem during communication
                 * @name NETWORK
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.ERROR
                 * @static
                 */
                NETWORK: "NETWORK",

                /**
                 * Internal error occurred
                 * @name INTERNAL
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.ERROR
                 * @static
                 */
                INTERNAL: "INTERNAL",

                /**
                 * Unauthorized to access the requested resource
                 * @name UNAUTHORIZED
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.ERROR
                 * @static
                 */
                UNAUTHORIZED: "UNAUTHORIZED",

                /**
                 * Error while parsing response
                 * @name INVALID
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.ERROR
                 * @static
                 */
                INVALID: "INVALID",

                /**
                 * Storing resource failed
                 * @name STORAGE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.ERROR
                 * @static
                 */
                STORAGE: "STORAGE",

                /**
                 * The request returns an empty dataset
                 * @name EMPTY_COLLECTION
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.ERROR
                 * @static
                 */
                EMPTY_COLLECTION: "EMPTY_COLLECTION",

                /**
                 * The Service is not available
                 * @name SERVICE_UNAVAILABLE
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.ERROR
                 * @static
                 */
                SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

                /**
                 * Unknown / Un-categorizable error
                 * A catch-all error and should not be used in most cases as there often is a more specific code
                 * @name UNKNOWN
                 * @type {String}
                 * @public
                 * @memberof vdk/errors/VIAError.ERROR
                 * @static
                 */
                UNKNOWN: "UNKNOWN"
            }
        },

        {
            /**
             * Init the VIAError moudle
             * @method init
             * @param {Number} facility 2 digital numbers, the facility of the error
             * @param {Number} errorCode 3 digital numbers, the error code of the error
             * @param {String} message the error message of the error, this parameter will be a public member
             * @param {Object} [cause] (optional) the error cause of the error
             * @memberof vdk/errors/VIAError#
             * @private
             */
            init: function (facility, errorCode, message, cause) {
                var errorConfig = config.get("via.error") || LocalErrorConfig;

                this.__facility = errorConfig.FACILITY[facility];
                this.__errorCode = errorConfig.ERROR[errorCode];
                this.__cause = cause || null;
                this.__code = this.__facility * 1000 + this.__errorCode;

                //message and name are public members
                this.message = message;
                this.name = this.__code.toString();

                mediator.publish(this.constructor.Event.ErrorOccurred, this);
            },

            /**
             * Get the facility of the error object.
             * @method getFacility
             * @return {Number} 2 digital numbers
             * @memberof vdk/errors/VIAError#
             * @public
             */
            getFacility: function () {
                return this.__facility;
            },

            /**
             * Get the error code of the error object.
             * @method getErrorCode
             * @return {Number} 1-3 digital numbers
             * @memberof vdk/errors/VIAError#
             * @public
             */
            getErrorCode: function () {
                return this.__errorCode;
            },

            /**
             * Get the combined code (facility and error code) of the error object.
             * @method getCode
             * @return {Number} 5 digital numbers
             * @memberof vdk/errors/VIAError#
             * @public
             */
            getCode: function () {
                return this.__code;
            },

            /**
             * Get the error message of the error object.
             * @method getMessage
             * @return {String} the error message
             * @memberof vdk/errors/VIAError#
             * @public
             */
            getMessage: function () {
                return this.message;
            },

            /**
             * Get the error cause of the error object.
             * @method getCause
             * @return {Object} the error cause
             * @memberof vdk/errors/VIAError#
             * @public
             */
            getCause: function () {
                return this.__cause;
            }
        });

    return VIAError;
});