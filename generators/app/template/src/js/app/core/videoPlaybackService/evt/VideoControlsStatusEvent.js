/**
 * VideoControlsStatusEvent is an enumeration of the events associated to video controls status change.
 * @readonly
 * @enum {String}
 */
define("app/core/videoPlaybackService/evt/VideoControlsStatusEvent", {

    DismissSelected: "VideoControlsStatusEvent:DismissSelected",

    PlaySelected: "VideoControlsStatusEvent:PlaySelected",

    PauseSelected: "VideoControlsStatusEvent:PauseSelected",

    PlayheadMoved: "VideoControlsStatusEvent:PlayheadMoved",

    NextPlaylistItemSelected: "VideoControlsStatusEvent:NextPlaylistItemSelected",

    PreviousPlaylistItemSelected: "VideoControlsStatusEvent:PreviousPlaylistItemSelected",

    RewindSelected: "VideoControlsStatusEvent:RewindSelected",

    FastForwardSelected: "VideoControlsStatusEvent:FastForwardSelected",

    QualityChanged: "VideoControlsStatusEvent:QualityChanged"
});