/**
 * AdEvent is an enumeration of advertisement events.
 * @readonly
 * @enum {String}
 */
define("app/core/videoPlaybackService/evt/AdEvent", {
    /**
     * The ad has paused
     */
    AdRollContentPaused: "AdEvent:AdRollContentPaused",
    /**
     * The ad has started
     */
    AdRollStarted: "AdEvent:AdRollStarted",
    /**
     * The ad has updated
     */
    AdRollUpdated: "AdEvent:AdRollUpdated",
    /**
     * The ad has finished
     */
    AdRollFinished: "AdEvent:AdRollFinished",
    /**
     * The ad has resumed
     */
    AdRollContentResumed: "AdEvent:AdRollContentResumed"
});