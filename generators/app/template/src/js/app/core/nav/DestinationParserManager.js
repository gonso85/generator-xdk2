/**
 * Returns a singleton responsible to handle the user related business logic.
 *
 * @class app/core/nav/DestinationParserManager
 */
define("app/core/nav/DestinationParserManager", [
    "xdk-base/class",
    "xdk-base/core",
    "xdk-base/exception",
    "xdk-base/util"
], function (
    klass,
    core,
    exception,
    util
) {

    var instance,
        DestinationParserManager;

    DestinationParserManager = klass.create({
        /**
         * Get the singleton instance of this class.
         * @method
         * @static
         * @returns {app/core/nav/DestinationParserManager} The singleton
         * @memberof app/core/nav/DestinationParserManager
         */
        singleton: function () {
            if (!instance) {
                instance = new DestinationParserManager();
            }

            return instance;
        }
    }, {

        /**
         * Store the registered parsers.
         * @memberof app/core/nav/DestinationParserManager
         * @private
         */
        __parserRegistry: [],

        /**
         * Add parser to parser manager.
         * @method addDestinationParser
         * @param {app/core/nav/interface/DestinationParser} parser the parser to add
         * @memberof app/core/nav/DestinationParserManager#
         * @public
         */
        addDestinationParser: function (parser) {
            if (this.__parserRegistry.indexOf(parser) > -1) {
                return;
            }

            this.__parserRegistry.push(parser);
        },

        /**
         * Parse the data into a route JSON object
         * @method parseFrom
         * @param {Object|String} source the data to parse
         * @returns {Object} Route JSON object
         * @throws {module:ax/exception.ILLEGAL_ARGUMENT} when all parsers cannot parse the source
         * @memberof app/core/nav/DestinationParserManager#
         * @public
         */
        parseFrom: function (source) {
            var parser;

            for (var i = 0, l = this.__parserRegistry.length; i < l; i++) {
                parser = this.__parserRegistry[i];

                if (parser.canParse(source)) {
                    return parser.parseFrom(source);
                }
            }

            throw core.createException(exception.ILLEGAL_ARGUMENT, "ParserError: No parser can parse the source: " + source);
        }
    });

    return DestinationParserManager;
});