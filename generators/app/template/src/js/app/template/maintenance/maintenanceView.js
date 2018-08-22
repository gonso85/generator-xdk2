define("app/template/maintenance/maintenanceView", [
    "xdk-ui-basic/Button",
    "xdk-ui-basic/Image",
    "xdk-ui-basic/Layout",
    "xdk-ui-basic/Label"
], function (
    Button,
    Image,
    Layout,
    Label
) {
    return function () {
        return {
            klass: Layout,
            id: "#maintenanceView",
            children: [{
                klass: Image,
                css: "bar",
                src: "img/maintenance/bar.png"
            }, {
                klass: Label,
                id: "maintenanceMessageTitle",
                css: "maintenance-message-title"
            }, {
                klass: Label,
                id: "maintenanceMessageContent",
                css: "maintenance-message-content"
            }, {
                klass: Button,
                id: "restartAppButton",
                text: "Start Application"
            }, {
                klass: Label,
                id: "maintenanceNotificationContent",
                css: "maintenance-notification-content"
            }]
        };
    };
});