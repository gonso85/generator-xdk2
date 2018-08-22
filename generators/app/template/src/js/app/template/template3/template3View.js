define("app/template/template3/template3View", [
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
                text: "view3"
            }]
        };
    };
});