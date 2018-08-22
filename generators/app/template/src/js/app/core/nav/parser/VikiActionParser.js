/**
 * VikiActionParser parses the page Uri to route JSON object
 *
 * @class app/core/nav/parser/VikiActionParser
 * @augments app/core/nav/interface/DestinationParser
 */
define("app/core/nav/parser/VikiActionParser", [
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

    var PREFIX = "vdk://action/";

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
            var actionId, action = {}, parameters;

            actionId = source.substring(PREFIX.length);
            index = actionId.indexOf("?");

            if (index > 0) {
                parameters = QueryString.parse(actionId.substring(index + 1));
                actionId = actionId.substring(0, index);
            }

            if(actionId){
                action.actionId = actionId;
                action.state = parameters || {};
                return action;
            }

            throw core.createException(exception.INTERNAL, "ParserError: The parser cannot parse the source: " + source);
        }
    });
});