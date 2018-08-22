define("app/template/sample/SampleCtrl", [
    "app/core/RoutableController",
    "app/mgr/AppConfigManager",
    "app/mgr/MessageDisplayHelper",
    "vdk/errors/LocalErrorConfig",
    "vdk/errors/VIAError",
    "xdk-ax/mediator",
    "xdk-ax/mvc/view",
    "xdk-base/class",
    "xdk-base/util",
    "./sampleView"
], function (
    RoutableController,
    AppConfigManager,
    MessageDisplayHelper,
    LocalErrorConfig,
    VIAError,
    mediator,
    view,
    klass,
    util,
    sampleView
) {

    return klass.create(RoutableController, {}, {

        init: function () {
            this.setView(view.render(sampleView));
        },

        setup: function (context) {
            this._super(context);

            /**
             ********************
             **Get page data*****
             ********************
             */
            var containersIds = [];

            if (context.pageData && context.pageData.containers) {
                containersIds = context.pageData.containers;
            }

            AppConfigManager.singleton().getContainersMetadataByIds(containersIds).then(util.bind(function (containersData) {
                var text = "You are using sample template under js/template folder" +
                "<br><br>The page id is: " + context.pageId +
                "<br><br>The page title is: " + (context.pageData.displaytext || context.pageData.title) +
                "<br><br>The containers data is:<br>" + JSON.stringify(containersData);
                this.getView().find("msg").setText(text);
            }, this));


            /**
             ********************************
             **Display a configured message**
             ********************************
             */
            // var sMessageDisplayHelper = MessageDisplayHelper.singleton(),
            //     messageId = "12345";
            // message = sMessageDisplayHelper.findMessageById(messageId);

            // if (message) {
            //     sMessageDisplayHelper.showMessage(message);
            // }
        },

        reset: function () {
            this._super();
        }

    });
});