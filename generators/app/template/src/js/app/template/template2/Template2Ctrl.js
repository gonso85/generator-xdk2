define("app/template/template2/Template2Ctrl", [
    "app/core/RoutableController",
    "xdk-ax/mediator",
    "xdk-ax/mvc/view",
    "xdk-base/class",
    "xdk-base/util",
    "./template2View"
], function (
    RoutableController,
    mediator,
    view,
    klass,
    util,
    template3View
) {

    return klass.create(RoutableController, {}, {

        init: function () {
            this.setView(view.render(template3View));
        },

        setup: function (context) {
            this._super(context);
        },

        reset: function () {
            this._super();
        }

    });
});