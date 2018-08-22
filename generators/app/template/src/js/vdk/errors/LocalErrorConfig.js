/**
 * The local error config code.
 *
 * @module vdk/errors/LocalErrorConfig
 */
define("vdk/errors/LocalErrorConfig", {

    FACILITY: {

        CONFIGURATION_SERVICE: 11,

        USER_SETTINGS_SERVICE: 12,

        ANALYTICS_SERVICE: 13,

        STATUS_SERVICE: 14,

        RESOURCE_SERVICE: 15,

        LOG_SERVICE: 16,

        CONTENT_SERVICE: 17,

        PLAYBACK_SERVICE: 22,

        AUTHENTICATION_SERVICE: 43,

        USER_MANAGER: 52,

        GENERAL: 90

    },

    ERROR: {

        NOT_FOUND: 1,

        NETWORK: 2,

        INTERNAL: 3,

        UNAUTHORIZED: 4,

        INVALID: 5,

        STORAGE: 6,

        EMPTY_COLLECTION: 7,

        SERVICE_UNAVAILABLE: 8,

        UNKNOWN: 911

    }
});