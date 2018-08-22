/**
 * VideoManager is the center and entry point of the video playback service.
 * VideoManager fires events to other components for a complete playback experience.
 *
 * @link https://accedobroadband.jira.com/wiki/display/VDKCTV/Playback+Service
 * @class app/core/videoPlaybackService/VideoManager
 * @fires module:app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent#SetControlsInPlayState
 * @fires module:app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent#SetControlsInPauseState
 * @fires module:app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent#SetControlsInBufferingState
 * @fires module:app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent#UpdatePlayheadState
 * @fires module:app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent#DismissControls
 * @fires module:app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent#NextPlaylistItem
 * @fires module:app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent#PreviousPlaylistItem
 * @fires module:app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent#NotifyError
 *
 * @example
 *
 *  var videoItem = new VideoItem({
 *      id: "id-of-the-item",
 *      url: "http://video.accedo.tv/id-of-the-item"
 *  });
 *
 *  var videoManager = new VideoManager();
 *  videoManager.playVideoItem(videoItem);
 *
 */
define("app/core/videoPlaybackService/VideoManager", [
    "xdk-base/class",
    "xdk-base/util",
    "xdk-ax/mediator",
    "app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent",
    "app/core/videoPlaybackService/model/Playlist",
    "vdk/errors/VIAError",
    "app/core/videoPlaybackService/evt/VideoControlsStatusEvent",
    "app/service/ServiceHolder",
    "xdk-base/console",
    "app/core/videoPlaybackService/model/VideoItem",
    "xdk-base/device/Media"
], function (
    klass,
    util,
    mediator,
    VideoPlaybackControlsEvent,
    Playlist,
    VIAError,
    VideoControlsStatusEvent,
    ServiceHolder,
    console,
    VideoItem,
    Media
) {

    var SKIP_TIME = 10; //10 seconds

    return klass.create({

        STATUS: {
            PLAYING: "PLAYING",
            PAUSED: "PAUSED",
            STOPPED: "STOPPED",
            BUFFERING: "BUFFERING"
        }

    }, {

        init: function () {
            this._sMedia = Media.singleton();
            this._registerPlaybackEventHandlers();
            this._registerPlaybackControlsStatusEventHandlers();
        },

        //the Playlist has to be the instance of class {app/core/videoPlaybackService/model/Playlist}
        setPlaylist: function (playlist) {
            this._playlist = playlist;
            this._playlist.currentItemIdx = -1;
        },

        getPlaylist: function () {
            return this._playlist;
        },

        clearPlaylist: function () {
            if (!this._playlist) {
                return;
            }

            this._playlist.items = [];
            this._playlist.currentItemIdx = -1;
        },

        /**
         * Play the video item.
         * If the playlist is set, then the video item has to be inside the list.
         * @method
         * @param {app/core/videoPlaybackService/model/VideoItem} playlistItem The playlist item to play
         * @param {Number} [pos] The position that the playback should start, count in secounds
         * @throws {VIAError} if the playlist is set, but the item is not in the list.
         * @memberof via/videoPlaybackService/VideoManager#
         */
        playVideoItem: function (videoItem, pos) {
            //if there's a playlist, then the video item should be in this playlist. 
            //Set the play list index first.
            if (this._playlist) {
                var indexInList = util.indexOf(this._playlist.items, videoItem);

                if (indexInList < 0) {
                    throw new VIAError(VIAError.FACILITY.PLAYBACK_SERVICE, VIAError.ERROR.INVALID, "There is a playlist, but the item is not in playlist");
                }

                this._playlist.currentItemIdx = indexInList;
            }

            var eventInfo = {};

            if (util.isNumber(pos)) {
                eventInfo.pos = pos;
            } else {
                eventInfo.pos = 0;
            }

            util.extend(eventInfo, this._packEventInfo(videoItem));

            this._play(videoItem, pos);
            this.__dispatchEvent(VideoPlaybackControlsEvent.SetControlsInPlayState, eventInfo);
        },

        nextItem: function () {
            var eventInfo;

            if (!this._playNextPlaylistItem()) {
                return;
            }

            eventInfo = this._packEventInfo(this._currentItem);
            this.__dispatchEvent(VideoPlaybackControlsEvent.NextPlaylistItem, eventInfo);
        },

        prevItem: function () {
            var eventInfo;

            if (!this._playPrevPlaylistItem()) {
                return;
            }

            eventInfo = this._packEventInfo(this._currentItem);
            this.__dispatchEvent(VideoPlaybackControlsEvent.PreviousPlaylistItem, eventInfo);
        },

        pause: function () {
            this._sMedia.pause();
            this.__dispatchEvent(VideoPlaybackControlsEvent.SetControlsInPauseState, {});
        },

        //Resume the previous paused playback.
        playResume: function () {
            if (this._playlist) {
                if (this._playlist.items.length === 0) {
                    throw new VIAError(VIAError.FACILITY.PLAYBACK_SERVICE, VIAError.ERROR.INVALID, "The playlist is empty");
                }

                if (this._playlist.currentItemIdx < 0) {
                    throw new VIAError(VIAError.FACILITY.PLAYBACK_SERVICE, VIAError.ERROR.INVALID, "No playing item in the playlist");
                }
            }

            var eventInfo = this._packEventInfo(this._currentItem);

            this._sMedia.resume();
            this.__dispatchEvent(VideoPlaybackControlsEvent.SetControlsInPlayState, eventInfo);
        },

        fastForward: function () {
            this.__dispatchEvent(VideoPlaybackControlsEvent.UpdatePlayheadState, {
                pos: this._currentPlaybackTime + SKIP_TIME
            });

            this._sMedia.skip({
                sec: SKIP_TIME,
                progressive: true,
                delaySec: 0.5
            });
        },

        rewind: function () {
            var pos = this._currentPlaybackTime - SKIP_TIME;
            pos = pos > 0 ? pos : 0;

            this.__dispatchEvent(VideoPlaybackControlsEvent.UpdatePlayheadState, {
                pos: pos
            });

            this._sMedia.skip({
                sec: -SKIP_TIME,
                progressive: true,
                delaySec: 0.5
            });
        },

        seek: function (pos) {
            this._seek(pos); //in second
            this.__dispatchEvent(VideoPlaybackControlsEvent.UpdatePlayheadState, {
                pos: pos
            });
        },

        dismiss: function () {
            this._sMedia.stop();
            this.__dispatchEvent(VideoPlaybackControlsEvent.DismissControls, {});
        },

        __dispatchEvent: function (event, eventInfo) {
            mediator.publish(event, eventInfo);
        },

        _registerPlaybackEventHandlers: function () {
            this.__bindedPlaybackFinished = util.bind(this._playbackFinished, this);
            this._sMedia.addEventListener(this._sMedia.EVT_FINISHED, this.__bindedPlaybackFinished);

            this.__bindedTimeUpdated = util.bind(this._timeUpdated, this);
            this._sMedia.addEventListener(this._sMedia.EVT_TIME_UPDATE, this.__bindedTimeUpdated);

            this.__bindedPlaybackErrorOccurred = util.bind(this._playbackErrorOccurred, this);
            this._sMedia.addEventListener(this._sMedia.EVT_ERROR, this.__bindedPlaybackErrorOccurred);

            this.__bindedPlaybackStateChanged = util.bind(this._playbackStateChanged, this);
            this._sMedia.addEventListener(this._sMedia.EVT_STATE_CHANGED, this.__bindedPlaybackStateChanged);
        },

        _registerPlaybackControlsStatusEventHandlers: function () {
            this.__bindedDismissSelected = util.bind(this._dismissSelected, this);
            mediator.subscribe(VideoControlsStatusEvent.DismissSelected, this.__bindedDismissSelected);

            this.__bindedPlaySelected = util.bind(this._playSelected, this);
            mediator.subscribe(VideoControlsStatusEvent.PlaySelected, this.__bindedPlaySelected);

            this.__bindedPauseSelected = util.bind(this._pauseSelected, this);
            mediator.subscribe(VideoControlsStatusEvent.PauseSelected, this.__bindedPauseSelected);

            this.__bindedRewindSelected = util.bind(this._rewindSelected, this);
            mediator.subscribe(VideoControlsStatusEvent.RewindSelected, this.__bindedRewindSelected);

            this.__bindedFastForwardSelected = util.bind(this._fastForwardSelected, this);
            mediator.subscribe(VideoControlsStatusEvent.FastForwardSelected, this.__bindedFastForwardSelected);

            this.__bindedPlayheadMoved = util.bind(this._playheadMoved, this);
            mediator.subscribe(VideoControlsStatusEvent.PlayheadMoved, this.__bindedPlayheadMoved);

            this.__bindedNextPlaylistItemSelected = util.bind(this._nextPlaylistItemSelected, this);
            mediator.subscribe(VideoControlsStatusEvent.NextPlaylistItemSelected, this.__bindedNextPlaylistItemSelected);

            this.__bindedPreviousPlaylistItemSelected = util.bind(this._previousPlaylistItemSelected, this);
            mediator.subscribe(VideoControlsStatusEvent.PreviousPlaylistItemSelected, this.__bindedPreviousPlaylistItemSelected);

            this.__bindedQualityChanged = util.bind(this._qualityChanged, this);
            mediator.subscribe(VideoControlsStatusEvent.QualityChanged, this.__bindedQualityChanged);
        },

        //Handler for VideoPlaybackStatusEvent from XDK media
        _playbackFinished: function () {
            this.__dispatchEvent(VideoPlaybackControlsEvent.DismissControls, {});
        },

        //Handler for VideoPlaybackStatusEvent from XDK media
        _timeUpdated: function (sec) {
            this._currentPlaybackTime = sec;
            this._playbackDuration = this._sMedia.getDuration();

            this.__dispatchEvent(VideoPlaybackControlsEvent.UpdatePlayheadState, {
                pos: sec,
                duration: this._playbackDuration
            });
        },

        //Handler for VideoPlaybackStatusEvent from XDK media
        _playbackErrorOccurred: function (error) {
            this.__dispatchEvent(VideoPlaybackControlsEvent.NotifyError, {
                error: error
            });
        },

        //Handler for VideoPlaybackStatusEvent from XDK media
        _playbackStateChanged: function (change) {
            switch (change.toState) {
            case this._sMedia.PLAYING:
                this._currentPlaybackState = this.constructor.STATUS.PLAYING;
                this.__dispatchEvent(VideoPlaybackControlsEvent.SetControlsInPlayState);

                if (this.__wasPausedBeforeQualityChanged) {
                    this.pause();
                    this.__wasPausedBeforeQualityChanged = false;
                }
                break;
            case this._sMedia.PAUSED:
                this._currentPlaybackState = this.constructor.STATUS.PAUSED;
                this.__dispatchEvent(VideoPlaybackControlsEvent.SetControlsInPauseState);
                break;
            case this._sMedia.STOPPED:
                this._currentPlaybackState = this.constructor.STATUS.STOPPED;
                break;
            case this._sMedia.BUFFERING:
                this._currentPlaybackState = this.constructor.STATUS.BUFFERING;
                this.__dispatchEvent(VideoPlaybackControlsEvent.SetControlsInBufferingState);
                break;
            default:
                return;
            }
        },

        //Handler for VideoControlsStatusEvent from video controllers
        _playSelected: function (data) {
            this._sMedia.resume();
        },

        //Handler for VideoControlsStatusEvent from video controllers
        _pauseSelected: function (data) {
            this._sMedia.pause();
        },

        //Handler for VideoControlsStatusEvent from video controllers
        _rewindSelected: function () {
            this.rewind();
        },

        //Handler for VideoControlsStatusEvent from video controllers
        _fastForwardSelected: function () {
            this.fastForward();
        },

        //Handler for VideoControlsStatusEvent from video controllers
        _playheadMoved: function (data) {
            this._seek(data.pos);
        },

        //Handler for VideoControlsStatusEvent from video controllers
        _nextPlaylistItemSelected: function (data) {
            this._playNextPlaylistItem();
        },

        //Handler for VideoControlsStatusEvent from video controllers
        _previousPlaylistItemSelected: function (data) {
            this._playPrevPlaylistItem();
        },

        //Handler for VideoControlsStatusEvent from video controllers
        _qualityChanged: function (data) {
            //you may need to add different paramater and ways to handle quality change
            if (this._currentItem.metadata.videoUrlIndex === data) {
                return;
            }

            this._currentItem.metadata.videoUrlIndex = data;

            if (this._sMedia.isState(this._sMedia.PAUSED)) {
                this.__wasPausedBeforeQualityChanged = true;
            }

            this._play(this._currentItem, this._currentPlaybackTime);
        },

        //Handler for VideoControlsStatusEvent from video controllers
        _dismissSelected: function (data) {
            this._sMedia.stop();
        },

        _play: function (videoItem, pos) {
            var loadData = util.extend({}, videoItem.metadata);
            loadData = util.extend(loadData, videoItem.drmAttributes);
            loadData.forceReload = true;

            this._currentItem = videoItem;
            this._currentPlaybackTime = pos || 0; //in seconds
            this._playbackDuration = videoItem.metadata.duration || 0;

            if (this._currentItem.url) {
                this._sMedia.load(this._currentItem.url, loadData);
            } else {
                this._currentItem.metadata = this._currentItem.metadata || {};
                var index = this._currentItem.metadata.videoUrlIndex || 0;
                this._sMedia.load(this._currentItem.urls[index].url, loadData);
            }

            this._sMedia.setFullscreen();
            this._sMedia.play(pos);
        },

        _seek: function (pos) { //in seconds
            this._sMedia.seek(pos);
        },

        _playNextPlaylistItem: function () {
            if (!this._playlist) {
                throw new VIAError(VIAError.FACILITY.PLAYBACK_SERVICE, VIAError.ERROR.INVALID, "Playlist is not set");
            }

            var len = this._playlist.items.length;

            if (len < 1) {
                throw new VIAError(VIAError.FACILITY.PLAYBACK_SERVICE, VIAError.ERROR.INVALID, "Playlist is empty");
            }

            // ignore if no next item available
            if (this._playlist.currentItemIdx >= len - 1) {
                return false;
            }

            // advance to the next item
            this._playlist.currentItemIdx++;
            this._currentItem = this._playlist.items[this._playlist.currentItemIdx];

            this._play(this._currentItem);

            return true;
        },

        _playPrevPlaylistItem: function () {
            if (!this._playlist) {
                throw new VIAError(VIAError.FACILITY.PLAYBACK_SERVICE, VIAError.ERROR.INVALID, "Playlist is not set");
            }

            var lastIndex = this._playlist.items.length - 1,
                currentItem,
                eventInfo;

            if (lastIndex < 0) {
                throw new VIAError(VIAError.FACILITY.PLAYBACK_SERVICE, VIAError.ERROR.INVALID, "Playlist is empty");
            }

            // ignore if no previous item available
            if (this._playlist.currentItemIdx <= 0) {
                return false;
            }

            this._playlist.currentItemIdx--;

            currentItem = this._playlist.items[this._playlist.currentItemIdx];
            eventInfo = this._packEventInfo(currentItem);

            this._play(currentItem);

            return true;
        },

        _packEventInfo: function (videoItem) {
            //Create an object from a videoItem for the Play event.
            var eventInfo = {
                id: videoItem.id,
                url: videoItem.url,
                urls: videoItem.urls,
                metadata: videoItem.metadata
            };

            if (videoItem.drmAttributes) {
                eventInfo.drmAttributes = videoItem.drmAttributes;
            }

            return eventInfo;
        },

        _unregisterPlaybackEventHandlers: function () {
            this._sMedia.removeEventListener(this._sMedia.EVT_FINISHED, this.__bindedPlaybackFinished);
            this._sMedia.removeEventListener(this._sMedia.EVT_TIME_UPDATE, this.__bindedTimeUpdated);
            this._sMedia.removeEventListener(this._sMedia.EVT_ERROR, this.__bindedPlaybackErrorOccurred);
            this._sMedia.removeEventListener(this._sMedia.EVT_STATE_CHANGED, this.__bindedPlaybackStateChanged);
        },

        _unregisterPlaybackControlsStatusEventHandlers: function () {
            mediator.unsubscribe(VideoControlsStatusEvent.DismissSelected, this.__bindedDismissSelected);
            mediator.unsubscribe(VideoControlsStatusEvent.PlaySelected, this.__bindedPlaySelected);
            mediator.unsubscribe(VideoControlsStatusEvent.PauseSelected, this.__bindedPauseSelected);
            mediator.unsubscribe(VideoControlsStatusEvent.RewindSelected, this.__bindedRewindSelected);
            mediator.unsubscribe(VideoControlsStatusEvent.FastForwardSelected, this.__bindedFastForwardSelected);
            mediator.unsubscribe(VideoControlsStatusEvent.PlayheadMoved, this.__bindedPlayheadMoved);
            mediator.unsubscribe(VideoControlsStatusEvent.NextPlaylistItemSelected, this.__bindedNextPlaylistItemSelected);
            mediator.unsubscribe(VideoControlsStatusEvent.PreviousPlaylistItemSelected, this.__bindedPreviousPlaylistItemSelected);
            mediator.unsubscribe(VideoControlsStatusEvent.QualityChanged, this.__bindedQualityChanged);
        },

        deinit: function () {
            this._unregisterPlaybackEventHandlers();
            this._unregisterPlaybackControlsStatusEventHandlers();
        }
    });
});