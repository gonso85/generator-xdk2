/**
 * The {VIEW_NAME} controller
 *
 * @class app/template/{TEMPLATE_NAME}/{CTRL_NAME}
 * @extends app/core/RoutableController
 */
define("app/template/{TEMPLATE_NAME}/{CTRL_NAME}", [
    "app/core/RoutableController",
    "xdk-ax/mediator",
    "xdk-ax/mvc/view",
    "xdk-base/class",
    "xdk-base/util",
    "xdk-ui-basic/Label",
    "./{DS_NAME}",
    "./{VIEW_NAME}"
], function(
    RoutableController,
    mediator,
    view,
    klass,
    util,
    Label,
    Ds,
    tmpl
) {

    return klass.create(RoutableController, {}, {

        init: function() {
            this.setView(view.render(tmpl));
        },

        setup: function(context) {
            this._super(context);
            this.ds = this.ds || new Ds();

            //sample usage of ds
            var sampleLabel = new Label({
                parent: this.getView()
            });
            this.ds.getSampleData().then(function(data) {
                sampleLabel.setText("{CTRL_NAME} is loaded. <br><br> Sample data for current controller is loaded: " + JSON.stringify(data));
            });
        },

        reset: function() {
            this._super();
            //you probably need to remove all the listeners here.
            //it's better to assign the local dom references to null if they won't be used anymore.
        }

    });
});