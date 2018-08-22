/**
 * Playlist stores the information of a series of playlist item {@see app/core/videoPlaybackService/model/VideoItem} and the current state of the playback.
 * The properties are accessible directly, as same as a plain JS object.
 * A public constructor can be used to initialize the values.
 *
 * @class app/core/videoPlaybackService/model/Playlist
 */
define("app/core/videoPlaybackService/model/Playlist", [
    "xdk-base/class"
], function (klass) {
    return klass.create({}, {
        /**
         * @property {app/core/videoPlaybackService/model/VideoItem[]} id The playlist items
         * @memberof app/core/videoPlaybackService/model/Playlist#
         */
        items: [],
        /**
         * @property {Number} currentItemIdx The index of the current playing list item
         * @memberof app/core/videoPlaybackService/model/Playlist#
         */
        currentItemIdx: 0,
        /**
         * @property {app/core/videoPlaybackService/model/PlaybackInfo} currentPlaybackInfo The playback information of the current list item
         * @memberof app/core/videoPlaybackService/model/Playlist#
         */
        currentPlaybackInfo: null,
        /**
         * @property {Object} metadata The metadata of this list
         * @memberof app/core/videoPlaybackService/model/Playlist#
         */
        metadata: {},

        /**
         * The constructor of this class, accessible using the `new` keyword.
         * @method
         * @param {Object} [opts] The initial values
         * @param {VideoItem[]} [opts.items] The playlist items
         * @param {Number} [opts.currentItemIdx] The index of the current playing list item
         * @param {Object} [opts.metadata={}] The metadata of this list
         * @memberof app/core/videoPlaybackService/model/Playlist#
         * @example
         *  var playlist = new Playlist({
         *      items: [item0, item1, item2],
         *      currentItemIdx: 1
         *  });
         *
         *  console.log(playlist.currentItemIdx); // 1
         */
        init: function (opts) {
            opts = opts || {};

            this.items = opts.items || [];
            this.currentItemIdx = opts.currentItemIdx || 0;
            this.metadata = opts.metadata || {};
        }

    });
});