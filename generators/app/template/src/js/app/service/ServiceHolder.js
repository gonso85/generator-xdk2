define("app/service/ServiceHolder", [
    "app/service/RemoteService",
    "vdk-appGrid/AppGridService",
    "xdk-base/class",
    "xdk-base/util",
    "xdk-base/config"
], function (
    RemoteService,
    AppGridService,
    klass,
    util,
    config
) {
    var USE_APPGRID_CONFIG = "APPGRID",
        USE_REMOTE_CONFIG = "REMOTE";

    var ServiceHolder,
        instance;

    ServiceHolder = klass.create({
        singleton: function () {
            if (!instance) {
                instance = new ServiceHolder();
            }

            return instance;
        }
    }, {

        init: function () {
            this.__appConfigPlacement = config.get("app.config");
        },

        getConfigurationService: function () {
            if (this.__configurationService) {
                return this.__configurationService;
            }

            if (this.__appConfigPlacement === USE_APPGRID_CONFIG) {
                this.__configurationService = this.__getAppGridService();
                return this.__configurationService;
            } else if (this.__appConfigPlacement === USE_REMOTE_CONFIG) {
                this.__configurationService = RemoteService.singleton();
                return this.__configurationService;
            }

            return null;
        },

        getStatusService: function () {
            if (this.__appConfigPlacement === USE_APPGRID_CONFIG) {
                this.__statusService = this.__statusService || this.__getAppGridService();
                return this.__statusService;
            }

            return null;
        },

        getResourceService: function () {
            if (this.__appConfigPlacement === USE_APPGRID_CONFIG) {
                this.__resourceService = this.__resourceService || this.__getAppGridService();
                return this.__resourceService;
            }

            return null;
        },

        getLoggingService: function () {
            if (this.__appConfigPlacement === USE_APPGRID_CONFIG) {
                this.__loggingService = this.__loggingService || this.__getAppGridService();
                return this.__loggingService;
            }

            return null;
        },

        __getAppGridService: function () {
            this.__appGridService = this.__appGridService || AppGridService.singleton();
            return this.__appGridService;
        }
    });

    return ServiceHolder;
});