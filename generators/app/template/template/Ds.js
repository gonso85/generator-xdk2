/**
 * The datasource for {TEMPLATE_NAME} template
 *
 * @class app/template/{TEMPLATE_NAME}/{DS_NAME}
 */
define("app/template/{TEMPLATE_NAME}/{DS_NAME}", [
	"xdk-base/class",
	"xdk-base/promise"
], function(
	klass,
	promise
) {

	return klass.create({}, {

		init: function() {

		},

		getSampleData: function() {
			var data = {
				"id": "hello-world"
			};

			return promise.resolve(data);
		}
	});
});