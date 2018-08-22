define("app/template/template4/Template4Ctrl", [
    "app/core/RoutableController",
    "xdk-ax/mediator",
    "xdk-ax/mvc/view",
    "xdk-base/class",
    "xdk-base/util",
    "./template4View"
], function (
    RoutableController,
    mediator,
    view,
    klass,
    util,
    template4View
) {

    return klass.create(RoutableController, {}, {

        init: function () {
            this.setView(view.render(template4View));
        },

        setup: function (context) {
            this._super(context);
        },

        reset: function () {
            this._super();
        }

    });
});