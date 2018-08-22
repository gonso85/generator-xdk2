define("app/template/template1/template1View", [
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
                text: "view1"
            }]
        };
    };
});