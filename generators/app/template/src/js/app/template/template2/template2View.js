define("app/template/template2/template2View", [
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
                text: "view2"
            }]
        };
    };
});