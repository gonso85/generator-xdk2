/**
 * VikiPageDestinationParser parses the page Uri to route JSON object
 *
 * @class app/core/nav/parser/VikiPageDestinationParser
 * @augments app/core/nav/interface/DestinationParser
 */
define("app/core/nav/parser/VikiPageDestinationParser", [
    "app/core/nav/interface/DestinationParser",
    "xdk-base/class",
    "xdk-base/core",
    "xdk-base/exception",
    "xdk-base/QueryString",
    "xdk-base/util"
], function (
    DestinationParser,
    klass,
    core,
    exception,
    QueryString,
    util
) {

    var PREFIX = "vdk://page/";

    return klass.create([DestinationParser], {}, {

        init: function (data) {
            this.__pages = data;
        },

        canParse: function (source) {
            if (!util.isString(source) || source.indexOf(PREFIX) !== 0) {
                return false;
            }

            return true;
        },

        parseFrom: function (source) {
            var route = {},
                pageId, pageData, index, parameters;

            pageId = source.substring(PREFIX.length);
            index = pageId.indexOf("?");

            if (index > 0) {
                parameters = QueryString.parse(pageId.substring(index + 1));
                pageId = pageId.substring(0, index);
            }

            pageData = this.__getPageDataById(pageId);

            if (pageData && pageData.template) {
                route.destination = pageData.template;
                route.newState = {};

                if (parameters) {
                    route.newState = parameters;
                }

                route.newState.pageId = pageId;
                route.newState.pageData = pageData;
                return route;
            }

            throw core.createException(exception.INTERNAL, "ParserError: The parser cannot parse the source: " + source);
        },

        __getPageDataById: function (id) {
            for (var i = 0, l = this.__pages.length; i < l; i++) {
                if (this.__pages[i].id === id) {
                    return this.__pages[i];
                }
            }

            return null;
        }
    });
});