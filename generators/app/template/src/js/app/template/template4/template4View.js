define("app/template/template4/template4View", [
    "xdk-ui-basic/Label",
    "xdk-ui-basic/Layout"
], function (
    Label,
    Layout
) {
    return function () {
        return {
            klass: Layout,
            children: [{
                klass: Label,
                text: "view4"
            }]
        };
    };
});