define("app/template/maintenance/MaintenanceCtrl", [
    "xdk-ax/evt/type",
    "xdk-ax/focusManager",
    "xdk-ax/mediator",
    "xdk-ax/mvc/view",
    "xdk-base/class",
    "xdk-base/util",
    "app/core/RoutableController",
    "app/mgr/AppConfigManager",
    "./maintenanceView"
], function (
    evtType,
    focusManager,
    mediator,
    view,
    klass,
    util,
    RoutableController,
    AppConfigManager,
    maintenanceView
) {
    var TEXT = {

        DEFAULT: {
            TITLE: "We'll be back soon!",
            MESSAGE: "We are currently undergoing maintenance. <br> We apologize for any inconvenience and thank you for your patience."
        },

        MAINTENANCE_END: {
            TITLE: "We are back!",
            MESSAGE: "The maintenance is finished. You can click the button below to start the application."
        }
    };

    return klass.create(RoutableController, {}, {

        init: function () {
            this.setView(view.render(maintenanceView));
        },

        setup: function (context) {
            this._super(context);

            var currentView = this.getView();
            this.__maintenanceMessageTitle = currentView.find("maintenanceMessageTitle");
            this.__maintenanceMessageContent = currentView.find("maintenanceMessageContent");

            //@todo: add event listener when AppGrid notification is done.
            this.__maintenanceNotificationContent = currentView.find("maintenanceNotificationContent");
            this.__restartAppButton = currentView.find("restartAppButton");
            this.__restartAppRef = util.bind(this.__restartApp, this);
            this.__restartAppButton.addEventListener(evtType.CLICK, this.__restartAppRef);
            this.__restartAppButton.hide();

            this.__addMessage();
            focusManager.focus(currentView);

            this._super(context);
        },

        __addMessage: function () {
            this.__maintenanceMessageTitle.setText(TEXT.DEFAULT.TITLE);

            AppConfigManager.singleton().getStatusMessage().then(util.bind(function (message) {
                this.__maintenanceMessageContent.setText(message);
            }, this), util.bind(this.__maintenanceMessageContent.setText, this, TEXT.DEFAULT.MESSAGE)).done();
        },

        __restartApp: function () {
            //this is for demo only, restarting application required device specific implementation.
            window.location.reload(false);
        }
    });
});