/**
 * The {VIEW_NAME} template
 *
 * @class app/template/{TEMPLATE_NAME}/{VIEW_NAME}
 */
define("app/template/{TEMPLATE_NAME}/{VIEW_NAME}", [
    "xdk-ui-basic/Layout"
], function (
    Layout
) {
    return function () {
        return {
            klass: Layout,
            id: "#{TEMPLATE_NAME}",
            children: []
        };
    };
});