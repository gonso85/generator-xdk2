define("app/mgr/UserManager", [
    "xdk-base/class",
    "xdk-base/config",
    "xdk-base/promise",
    "xdk-base/util"
], function (
    klass,
    config,
    promise,
    util
) {

    var UserManager,
        instance;

    UserManager = klass.create({

        Event: {
            UserSessionUpdated: "UserManagerEvent:UserSessionUpdated"
        },

        USER_STATE: {
            AUTH: "AUTH",
            DEFAULT: "DEFAULT",
            GUEST: "GUEST"
        },

        singleton: function () {
            if (!instance) {
                instance = new UserManager();
            }

            return instance;
        }
    }, {

        login: function () {},

        logout: function () {},

        restorePersistentLogin: function () {},

        getUserState: function () {
            //@todo: to be finished in Authentication Epic VDKCTV-7
            return this.constructor.USER_STATE.DEFAULT;
        }
    });

    return UserManager;
});