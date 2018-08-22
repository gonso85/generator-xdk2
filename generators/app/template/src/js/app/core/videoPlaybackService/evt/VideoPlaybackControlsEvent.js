/**
 * VideoPlaybackControlsEvent is an enumeration of the events used to notify the UI a particular event has happened.
 * @readonly
 * @enum {String}
 */
define("app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent", {
    /**
     * The playback is playing
     */
    SetControlsInPlayState: "VideoPlaybackControlsEvent:SetControlsInPlayState",
    /**
     * The playback is paused
     */
    SetControlsInPauseState: "VideoPlaybackControlsEvent:SetControlsInPauseState",
    /**
     * The playback is buffering
     */
    SetControlsInBufferingState: "VideoPlaybackControlsEvent:SetControlsInBufferingState",
    /**
     * Update the playback playhead position
     */
    UpdatePlayheadState: "VideoPlaybackControlsEvent:UpdatePlayheadState",
    /**
     * Dismiss the controls
     */
    DismissControls: "VideoPlaybackControlsEvent:DismissControls",
    /**
     * The next playlist item is played
     */
    NextPlaylistItem: "VideoPlaybackControlsEvent:NextPlaylistItem",
    /**
     * The previous playlist item is played
     */
    PreviousPlaylistItem: "VideoPlaybackControlsEvent:PreviousPlaylistItem",
    /**
     * Error occured
     */
    NotifyError: "VideoPlaybackControlsEvent:NotifyError",
    /**
     * Suspend the UI
     */
    SuspendUI: "VideoPlaybackControlsEvent:SuspendUI"
});