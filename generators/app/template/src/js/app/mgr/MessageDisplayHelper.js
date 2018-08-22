/**
 * Message display helper manage all message display. A message should be displayed through this helper.
 * All the message widgets should be included here.
 *
 * @class app/mgr/MessageDisplayHelper
 */
define("app/mgr/MessageDisplayHelper", [
    "vdk-message/Alert",
    "vdk-message/FullscreenMessage",
    "vdk-message/Toast",
    "xdk-base/class",
    "xdk-base/config",
    "xdk-base/util"
], function (
    Alert,
    FullscreenAlert,
    Toast,
    klass,
    config,
    util
) {

    var instance,
        MessageDisplayHelper;

    MessageDisplayHelper = klass.create({

        TYPE: {
            FULLSCREEN: "fullscreen",

            ALERT: "alert",

            POPUP: "popup",

            TOAST: "toast"
        },

        /**
         * Get the singleton instance of this class.
         * @method
         * @static
         * @returns {app/mgr/MessageDisplayHelper} The singleton
         * @memberof app/mgr/MessageDisplayHelper#
         */
        singleton: function () {
            if (!instance) {
                instance = new MessageDisplayHelper();
            }

            return instance;
        }
    }, {

        /**
         * Display the message in the proper way by given info
         * @method showMessage
         * @public
         * @param {Object} data the message data object
         * @param {String} [data.title]  the title
         * @param {String} [data.code]  the code
         * @param {String} [data.message] the message
         * @param {String} [data.type] the UI type of the message display
         * @memberof app/mgr/MessageDisplayHelper#
         */
        showMessage: function (data) {
            var displayOpts = {},
                display,
                TYPE = this.constructor.TYPE;

            if (data.code) {
                displayOpts.message = data.code + " " + data.message;
            } else {
                displayOpts.message = data.message;
            }

            displayOpts.title = data.title;

            switch (data.type) {
            case TYPE.FULLSCREEN:
                display = new FullscreenAlert(displayOpts);
                break;

            case TYPE.TOAST:
                display = new Toast(displayOpts);
                break;

            case TYPE.ALERT:
            case TYPE.POPUP:
                display = new Alert(displayOpts);
                break;

            default:
                display = new Alert(displayOpts);
            }

            return display;
        },

        /**
         * Display the error message in the proper way by given error object
         * @method showError
         * @public
         * @param {vdk/errors/VIAError} error the error object
         * @memberof app/mgr/MessageDisplayHelper#
         * @returns {app/wgt/Alert|app/wgt/Fullscreen|app/wgt/Toast} one kind of message display
         */
        showError: function (error) {
            var id = error.getCode().toString(),
                data = this.findMessageById(id);

            //if there is no customized message, then use the original error message.
            if (!data) {
                var alert = new Alert({
                    title: "Error",
                    message: id + " " + error.getMessage()
                });

                return alert;
            }

            return this.showMessage(data);
        },

        findMessageById: function (id) {
            this.__messagesConfig = this.__messagesConfig || config.get("app.messages");

            if (!this.__messagesConfig) {
                return null;
            }

            id = id.toString();

            for (var i = 0, l = this.__messagesConfig.length; i < l; i++) {
                if (this.__messagesConfig[i].id === id && this.__messagesConfig[i].message) {
                    return this.__messagesConfig[i];
                }
            }

            return null;
        }
    });

    return MessageDisplayHelper;
});