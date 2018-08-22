define("app/service/RemoteService", [
    "vdk/errors/VIAError",
    "xdk-base/ajax",
    "xdk-base/class",
    "xdk-base/config",
    "xdk-base/MemCache",
    "xdk-base/promise",
    "xdk-base/util"
], function (
    VIAError,
    ajax,
    klass,
    config,
    MemCache,
    promise,
    util
) {
    var TTL = 5 * 60 * 60, //cache for 5 hours
        CACHE_KEY_ALL_CONFIGS = "REMOTE_SERVICE_ALL_CONFIGS";

    var instance,
        RemoteService = klass.create([], {

            /**
             * Get the singleton instance of this class.
             * @method
             * @static
             * @returns {app/service/RemoteService} The singleton
             * @memberof app/service/RemoteService
             */
            singleton: function () {
                if (!instance) {
                    instance = new RemoteService();
                }

                return instance;
            }
        }, {

            /**
             * Init the remote server service
             * @method init
             * @param {String} api the base URL for the remote server
             * @memberof app/service/RemoteService#
             * @private
             */
            init: function () {
                var remoteConfig = config.get("remote");

                if (!remoteConfig || !remoteConfig.api) {
                    throw new VIAError(VIAError.FACILITY.CONFIGURATION_SERVICE, VIAError.ERROR.INVALID, "Cannot init the remote service without config api.");
                }

                this.__baseURL = remoteConfig.api;
                this.__memCache = new MemCache({
                    ttl: TTL,
                    gc: MemCache.GC.EXCEED_LIMIT
                });
            },

            /**
             * RemoteService - ConfigurationService
             * Get all the config in app config file on the remote server.
             * @method getAllConfigs
             * @returns {Promise.<Object>} Configuration value map by keys
             * @throws {Promise.<vdk/errors/VIAError>} Internal error object
             * @memberof app/service/RemoteService#
             * @public
             */
            getAllConfigs: function () {
                var cacheObj = this.__memCache.get(CACHE_KEY_ALL_CONFIGS);

                if (cacheObj !== undefined && !this.__memCache.isExpired(CACHE_KEY_ALL_CONFIGS)) {
                    return promise.resolve(cacheObj);
                }

                return ajax.request(this.__baseURL).then(util.bind(function (data) {
                    var ret = util.parse(data.responseText);
                    this.__memCache.set(CACHE_KEY_ALL_CONFIGS, ret);

                    return util.parse(data.responseText);
                }, this));
            }
        });

    return RemoteService;
});