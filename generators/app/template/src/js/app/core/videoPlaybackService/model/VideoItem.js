/**
 * VideoItem stores the information of a playable content, which is placed inside a playlist as an playlist item.
 * The properties are accessible directly, as same as a plain JS object.
 * A public constructor can be used to initialize the values.
 *
 * @class app/core/videoPlaybackService/model/VideoItem
 */
define("app/core/videoPlaybackService/model/VideoItem", [
    "xdk-base/class"
], function (klass) {
    return klass.create({}, {
        /**
         * @property {String} id The item id
         * @memberof app/core/videoPlaybackService/model/VideoItem#
         */
        id: null,
        /**
         * @property {String} url The item url
         * @memberof app/core/videoPlaybackService/model/VideoItem#
         */
        url: null,
        /**
         * @property {Array} urls Different url objects with different qualities
         * @memberof app/core/videoPlaybackService/model/VideoItem#
         */
        urls: null,
        /**
         * @property {Object} metadata The metadata of this item
         * @memberof app/core/videoPlaybackService/model/VideoItem#
         */
        metadata: {},
        /**
         * @property {Object} drmAttributes The data used to gain access to the playable content under DRM
         * @memberof app/core/videoPlaybackService/model/VideoItem#
         */
        drmAttributes: {},

        /**
         * The constructor of this class, accessible using the `new` keyword.
         * @method
         * @param {Object} [opts] The initial values
         * @param {String} [opts.id] The item id
         * @param {String} [opts.url] The item url
         * @param {Array} [opts.urls] The item url objects
         * @param {Object} [opts.metadata={}] The metadata of this item
         * @param {Object} [opts.drmAttributes={}] The DRM attributes of this item
         * @memberof app/core/videoPlaybackService/model/VideoItem#
         * @example
         *  var VideoItem = new VideoItem({
         *      id: "id-of-the-item",
         *      url: "http://video.accedo.tv/id-of-the-item"
         *  });
         *
         *  console.log(VideoItem.url); // http://video.accedo.tv/id-of-the-item
         */
        init: function (opts) {
            opts = opts || {};

            this.id = opts.id || null;
            this.url = opts.url || null;
            this.urls = opts.urls || null;
            this.metadata = opts.metadata || {};
            this.drmAttributes = opts.drmAttributes || null;
        }
    });
});