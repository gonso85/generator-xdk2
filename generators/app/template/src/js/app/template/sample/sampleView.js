define("app/template/sample/sampleView", [
    "xdk-ui-basic/Button",
    "xdk-ui-basic/Layout",
    "xdk-ui-basic/Label"
], function (
    Button,
    Layout,
    Label
) {
    return function () {
        return {
            klass: Layout,
            id: "#sample",
            children: [{
                klass: Label,
                id: "msg"
            }]
        };
    };
});