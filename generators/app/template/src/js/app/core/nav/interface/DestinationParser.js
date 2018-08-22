/**
 * DestinationParser Interface
 * @name DestinationParser
 * @class app/core/nav/interface/DestinationParser
 */
define("app/core/nav/interface/DestinationParser", ["xdk-base/Interface"], function (Interface) {
    return Interface.create("DestinationParser", {
        /**
         * Check if the data can be parsed by the parser
         * @method canParse
         * @abstract
         * @param {Object|String} source the data to check
         * @returns {Bool} Whether the data can be parsed by the parser
         * @memberof app/core/nav/interface/DestinationParser#
         * @public
         */
        canParse: ["source"],

        /**
         * Parse the data into a route JSON object
         * @method parseFrom
         * @abstract
         * @param {Object|String} source the data to parse
         * @returns {Object} Route JSON object
         * @throws {module:ax/exception.INTERNAL} when the parser cannot parse the source
         * @memberof app/core/nav/interface/DestinationParser#
         * @public
         */
        parseFrom: ["source"]
    });
});