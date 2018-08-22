define("app/template/fullscreenPlayer/FullscreenPlayerCtrl", [
    "app/core/History",
    "app/core/RoutableController",
    "app/core/videoPlaybackService/evt/VideoControlsStatusEvent",
    "app/core/videoPlaybackService/evt/VideoPlaybackControlsEvent",
    "app/core/videoPlaybackService/model/Playlist",
    "app/core/videoPlaybackService/model/VideoItem",
    "app/core/videoPlaybackService/VideoManager",
    "app/mgr/AppConfigManager",
    "app/mgr/MessageDisplayHelper",
    "vdk/errors/VIAError",
    "vdk-loading/Loading",
    "xdk-ax/data/LocalDatasource",
    "xdk-ax/evt/type",
    "xdk-ax/focusManager",
    "xdk-ax/mediator",
    "xdk-ax/mvc/AppRoot",
    "xdk-ax/mvc/view",
    "xdk-base/class",
    "xdk-base/device/vKey",
    "xdk-mouse/mouseHandler",
    "xdk-ui-basic/Button",
    "xdk-ui-grid/BoundedGrid",
    "xdk-base/promise",
    "xdk-base/util",
    "./fullscreenPlayerView"
], function (
    HistoryManager,
    RoutableController,
    VideoControlsStatusEvent,
    VideoPlaybackControlsEvent,
    Playlist,
    VideoItem,
    VideoManager,
    AppConfigManager,
    MessageDisplayHelper,
    VIAError,
    Loading,
    LocalDatasource,
    evtType,
    focusManager,
    mediator,
    AppRoot,
    view,
    klass,
    vKey,
    mouseHandler,
    Button,
    Grid,
    promise,
    util,
    fullscreenPlayerView
) {

    //Sample with single URL
    //To be removed
    var SAMPLE_URL = "http://d2bqeap5aduv6p.cloudfront.net/elephant_dreams_640x352_1171kbs_11min.mp4";

    //Sample with different quality URLs
    //To be removed
    var SAMPLE_URLS;

    /** @Sample
     *  SAMPLE_URLS = [{
     *      title: "High(720p)",
     *      url: "samplevideos/720.mp4"
     *  }, {
     *      title: "Mid(360p)",
     *      url: "samplevideos/360.mp4"
     *  }, {
     *      title: "Low(360p)",
     *      url: "samplevideos/360.mp4"
     *  }];
     */


    var DEFAULT_QUALITY_INDEX = 0,
        AUTO_HIDE_TIMER = 5000,

        hideUITimer;

    return klass.create(RoutableController, {}, {

        init: function () {
            this.setView(view.render(fullscreenPlayerView));
        },

        setup: function (context) {
            this._super(context);

            //Sample parameters, to be removed
            context.urls = context.urls || SAMPLE_URLS; //when there are multiple urls for the video item (high priority)
            context.url = context.url || SAMPLE_URL; //when there is single url for the video item

            var currentView = this.getView();

            this.__rewindButton = currentView.find("rewind");
            this.__playOrPauseButton = currentView.find("playOrPause");
            this.__fastForwardButton = currentView.find("fastForward");
            this.__settingButton = currentView.find("setting");
            this.__playerButtonContainer = currentView.find("playerButtonContainer");
            this.__mouseCloseButton = currentView.find("mouseCloseButton");

            this.__qualityList = currentView.find("qualityList");
            this.__progressBar = currentView.find("progressBar");
            this.__progressPoint = currentView.find("progressPoint");
            this.__durationLabel = currentView.find("duration");
            this.__currentTimeLabel = currentView.find("currentTime");
            this.__pointerTimeLable = currentView.find("pointerTime");
            this.__pointerTimeContainer = currentView.find("pointerTimeContainer");
            this.__progressBarContainer = currentView.find("progressBarContainer");

            this.__fullscreenFocus = currentView.find("fullscreenFocus");
            this.__playerBackground = currentView.find("playerBackground");
            this.__playerControllerContainer = currentView.find("playerControllerContainer");

            this.__onKeyRef = util.bind(this.onKey, this);
            currentView.addEventListener(evtType.KEY, this.__onKeyRef);
            AppRoot.singleton().getView().addClass("fullscreen-video-mode");

            focusManager.focus(this.__playerButtonContainer);

            this.__initTime();
            this.__setPlaybackButtons();
            this.__setProgressBarDrag();
            this.__setPlayback(context);
        },

        __initTime: function () {
            this.__currentTimeLabel.setText("00:00");
            this.__durationLabel.setText("--:--");
        },

        __setPlaybackButtons: function () {
            this.__setControlsInPlayStateRef = util.bind(this._setControlsInPlayState, this);
            this.__setControlsInPauseStateRef = util.bind(this._setControlsInPauseState, this);
            this.__setControlsInBufferingStateRef = util.bind(this._setControlsInBufferingState, this);
            this.__updatePlayheadStateRef = util.bind(this._updatePlayheadState, this);
            this.__dismissControlsRef = util.bind(this._dismissControls, this);
            this.__notifyErrorRef = util.bind(this._notifyError, this);

            mediator.subscribe(VideoPlaybackControlsEvent.SetControlsInPlayState, this.__setControlsInPlayStateRef);
            mediator.subscribe(VideoPlaybackControlsEvent.SetControlsInPauseState, this.__setControlsInPauseStateRef);
            mediator.subscribe(VideoPlaybackControlsEvent.SetControlsInBufferingState, this.__setControlsInBufferingStateRef);
            mediator.subscribe(VideoPlaybackControlsEvent.UpdatePlayheadState, this.__updatePlayheadStateRef);
            mediator.subscribe(VideoPlaybackControlsEvent.DismissControls, this.__dismissControlsRef);
            mediator.subscribe(VideoPlaybackControlsEvent.NotifyError, this.__notifyErrorRef);

            this.__rewindButtonPressedRef = util.bind(this.__rewindButtonPressed, this);
            this.__playOrPauseButtonPressedRef = util.bind(this.__playOrPauseButtonPressed, this);
            this.__fastForwardButtonPressedRef = util.bind(this.__fastForwardButtonPressed, this);
            this.__settingButtonPressedRef = util.bind(this.__settingButtonPressed, this);

            this.__playerBackgroundHTML = this.__playerBackground.getRoot().getHTMLElement();
            this.__playerBackgroundOnMouseClickRef = util.bind(function () {
                if (this.__qualityListIsShown) {
                    this.__hideQualityList();
                    return;
                }

                this.__playOrPauseButtonPressed();
                focusManager.focus(this.__fullscreenFocus);
            }, this);

            this.__rewindButton.addEventListener(evtType.CLICK, this.__rewindButtonPressedRef);
            this.__playOrPauseButton.addEventListener(evtType.CLICK, this.__playOrPauseButtonPressedRef);
            this.__fastForwardButton.addEventListener(evtType.CLICK, this.__fastForwardButtonPressedRef);
            this.__settingButton.addEventListener(evtType.CLICK, this.__settingButtonPressedRef);

            this.__mouseCloseButtonHTML = this.__mouseCloseButton.getRoot().getHTMLElement();
            this.__mouseCloseButtonOnMouseClickRef = util.bind(this.__mouseCloseButtonOnMouseClick, this);
            this.__mouseCloseButtonHTML.addEventListener("click", this.__mouseCloseButtonOnMouseClickRef);
            this.__playerBackgroundHTML.addEventListener("click", this.__playerBackgroundOnMouseClickRef);
        },

        __setProgressBarDrag: function () {
            this.__progressBarContainerHTML = this.__progressBarContainer.getRoot().getHTMLElement();

            var progressBarContainerStyle = window.getComputedStyle(this.__progressBarContainerHTML),
                progressBarBorderLeftWidth = parseInt(progressBarContainerStyle.borderLeftWidth, 10),
                progressBarBorderRightWidth = parseInt(progressBarContainerStyle.borderRightWidth, 10),
                progressBarContainerWidth = this.__progressBarContainerHTML.offsetWidth - progressBarBorderLeftWidth - progressBarBorderRightWidth,
                progressBarOffsetLeft = this.__progressBarContainerHTML.offsetLeft + progressBarBorderLeftWidth;

            this.__progressBarContainerOnMouseOverRef = util.bind(function (event) {
                this.__mouseOverFromProgressBar = true;
                this.__progressBar.addClass("focused");
                this.__progressPoint.addClass("focused");
                this.__progressBarContainer.addClass("focused");
                this.__pointerTimeContainer.addClass("visible");
            }, this);

            this.__progressBarContainerOnMouseOutRef = util.bind(function (event) {
                this.__mouseOverFromProgressBar = false;

                if (!this.__mouseDownFromProgressBar) {
                    this.__progressBar.removeClass("focused");
                    this.__progressPoint.removeClass("focused");
                    this.__progressBarContainer.removeClass("focused");
                    this.__pointerTimeContainer.removeClass("visible");
                }
            }, this);

            this.__progressBarContainerOnMouseDownRef = util.bind(function (event) {
                if (this.__status && this.__status === "hidden") {
                    return;
                }

                if (event.clientX - progressBarOffsetLeft > progressBarContainerWidth) {
                    return;
                }

                this.__mouseDownFromProgressBar = true;
                this.__progressBar.getRoot().getHTMLElement().style.width = event.clientX - progressBarOffsetLeft + "px";
            }, this);

            this.__documentOnMouseUpRef = util.bind(function (event) {
                if (!this.__mouseOverFromProgressBar) {
                    this.__progressPoint.removeClass("focused");
                }

                if (this.__mouseDownFromProgressBar) {
                    var pos = (event.clientX - progressBarOffsetLeft) / progressBarContainerWidth * this.__duration;

                    if (pos > this.__duration) {
                        return;
                    }

                    this.__setTime(pos);
                    this.__mouseDownFromProgressBar = false;

                    mediator.publish(VideoControlsStatusEvent.PlayheadMoved, {
                        pos: pos
                    });

                    this.__progressBar.removeClass("focused");
                    this.__progressPoint.removeClass("focused");
                    this.__progressBarContainer.removeClass("focused");
                    this.__pointerTimeContainer.removeClass("visible");

                    return;
                }
            }, this);

            this.__documentOnMouseMoveRef = util.bind(function (event) {
                this.__showUIWithoutFocus();

                if (!this.__mouseOverFromProgressBar && !this.__mouseDownFromProgressBar) {
                    return;
                }

                var x = event.clientX;

                if (x >= progressBarOffsetLeft + progressBarContainerWidth) {
                    x = progressBarOffsetLeft + progressBarContainerWidth - 1;
                }

                if (x < progressBarOffsetLeft) {
                    x = progressBarOffsetLeft;
                }

                this.__progressPoint.getRoot().getHTMLElement().style.left = x - progressBarOffsetLeft + "px";
                this.__pointerTimeContainer.getRoot().getHTMLElement().style.left = x - progressBarOffsetLeft + "px";

                var pointerTime = (x - progressBarOffsetLeft) / progressBarContainerWidth * this.__duration;

                if (pointerTime) {
                    this.__pointerTimeLable.setText(this.__formatTime(pointerTime));
                    this.__pointerTimeContainer.addClass("visible");
                }

                this.__progressPoint.addClass("focused");

                if (this.__mouseDownFromProgressBar) {
                    this.__progressBar.getRoot().getHTMLElement().style.width = x - progressBarOffsetLeft + "px";
                }
            }, this);

            this.__progressBarContainerHTML.addEventListener("mouseover", this.__progressBarContainerOnMouseOverRef);
            this.__progressBarContainerHTML.addEventListener("mouseout", this.__progressBarContainerOnMouseOutRef);
            this.__progressBarContainerHTML.addEventListener("mousedown", this.__progressBarContainerOnMouseDownRef);

            document.addEventListener("mouseup", this.__documentOnMouseUpRef);
            document.addEventListener("mousemove", this.__documentOnMouseMoveRef);
        },

        __setPlayback: function (context) {
            if (context.urls) {
                this.__currentVideoItem = new VideoItem({
                    urls: context.urls,
                    metadata: {
                        videoUrlIndex: DEFAULT_QUALITY_INDEX
                    }
                });

                this.__setQualityList(this.__currentVideoItem.urls);
            } else {
                this.__currentVideoItem = new VideoItem({
                    url: context.url
                });
            }

            this.__videoManager = new VideoManager();
            this.__videoManager.playVideoItem(this.__currentVideoItem);
        },

        __setQualityList: function (data) {
            this.__qualityList = new Grid({
                css: "quality-list",
                rows: 1,
                cols: data.length,
                parent: this.__playerControllerContainer,
                alignment: Grid.VERTICAL
            });

            this.__settingButton.setOption("nextUp", this.__qualityList);
            this.__qualityList.setOption("nextDown", this.__settingButton);

            for (var i = 0, l = data.length; i < l; i++) {
                data[i].index = i;
            }

            var ds = new LocalDatasource(),
                dataLoader = function () {
                    return promise.resolve({
                        data: data,
                        total: data.length
                    });
                };

            ds.setDataLoader(dataLoader);

            this.__qualityList.setDisplayStgy(util.bind(function (data) {
                var button = new Button({
                    text: data.title
                });

                if (data.index === DEFAULT_QUALITY_INDEX) {
                    this.__currentSelectedQualityButton = button;
                    this.__currentSelectedQualityButton.addClass("selected");
                }

                button.addEventListener(evtType.CLICK, util.bind(function () {
                    this.__currentSelectedQualityButton.removeClass("selected");
                    this.__currentSelectedQualityButton = button;
                    button.addClass("selected");
                    this.__hideQualityList();

                    mediator.publish(VideoControlsStatusEvent.QualityChanged, data.index);
                }, this));
                return button;
            }, this));

            this.__qualityList.setDatasource(ds);
        },

        //Handler for VideoPlaybackControlsEvent from VideoManger
        _setControlsInPlayState: function (data) {
            this.__transitionToPlayingStateNotFiringEvent();
            this.__buffering = false;
            Loading.close();
        },

        //Handler for VideoPlaybackControlsEvent from VideoManger
        _setControlsInPauseState: function (data) {
            this.__transitionToPausedStateNotFiringEvent();
            this.__buffering = false;
            Loading.close();
        },

        //Handler for VideoPlaybackControlsEvent from VideoManger
        _setControlsInBufferingState: function () {
            this.__buffering = true;

            //for a better UX, add 1s delay to reduce the loading bar flashing
            util.delay(1).then(util.bind(function () {
                if (this.__buffering) {
                    Loading.open();
                }
            }, this));
        },

        //Handler for VideoPlaybackControlsEvent from VideoManger
        _updatePlayheadState: function (data) {
            if (this.__mouseDownFromProgressBar) {
                return;
            }

            this.updateTime(data.pos);

            if (data.duration && !this.__duration) {
                this.__duration = data.duration;
            }
        },

        //Handler for VideoPlaybackControlsEvent from VideoManger
        _dismissControls: function (data) {
            this.setUIForStoppedState();
            this.updateTime(0);
        },

        //Handler for VideoPlaybackControlsEvent from VideoManger
        _notifyError: function (data) {
            this.__showUI();

            if (hideUITimer) {
                clearTimeout(hideUITimer);
            }

            var error = new VIAError(VIAError.FACILITY.PLAYBACK_SERVICE, VIAError.ERROR.INVALID, data.error.errorMessage),
                dialog = MessageDisplayHelper.singleton().showError(error);

            dialog.addEventListener(evtType.CLOSE, util.bind(function () {
                util.defer().then(util.bind(this.__finished, this)).done();
            }, this));
        },

        __mouseCloseButtonOnMouseClick: function () {
            mediator.publish(VideoControlsStatusEvent.DismissSelected);
            this.__finished();
        },

        __rewindButtonPressed: function () {
            if (this.__status && this.__status === "hidden") {
                return;
            }

            mediator.publish(VideoControlsStatusEvent.RewindSelected);
        },

        __playOrPauseButtonPressed: function () {
            if (this.__status && this.__status === "hidden") {
                return;
            }

            if (this.__videoIsPlaying) {
                this.__transitionToPausedState();
                return;
            }

            this.__transitionToPlayingState();
        },

        __fastForwardButtonPressed: function () {
            if (this.__status && this.__status === "hidden") {
                return;
            }

            mediator.publish(VideoControlsStatusEvent.FastForwardSelected);
        },

        __settingButtonPressed: function () {
            if (!this.__qualityList) {
                return;
            }

            if (this.__qualityListIsShown) {
                this.__hideQualityList();
                return;
            }

            this.__showQualityList();
        },

        __showQualityList: function () {
            this.__qualityList.addClass("show");
            this.__qualityListIsShown = true;

            this.__settingButton.addClass("selected");
            this.__settingButton.setOption("nextUp", this.__qualityList);

            if (!mouseHandler.isMouseOn()) {
                focusManager.focus(this.__qualityList);
            }
        },

        __hideQualityList: function () {
            if (!this.__qualityListIsShown) {
                return;
            }

            this.__qualityList.removeClass("show");
            this.__qualityListIsShown = false;

            this.__settingButton.removeClass("selected");
            this.__settingButton.setOption("nextUp", null);

            if (mouseHandler.isMouseOn()) {
                focusManager.focus(this.__fullscreenFocus);
                return;
            }

            focusManager.focus(this.__settingButton);
        },

        __transitionToPlayingStoppedEvent: function () {
            mediator.publish(VideoControlsStatusEvent.DismissSelected);
            this.setUIForStoppedState();
            this.updateTime(0);
        },

        __transitionToPlayingState: function () {
            mediator.publish(VideoControlsStatusEvent.PlaySelected);
            this.__transitionToPlayingStateNotFiringEvent();
        },

        __transitionToPlayingStateNotFiringEvent: function () {
            this.__videoIsPlaying = true;
            this.setUIForPlayingState();
        },

        __transitionToPausedState: function () {
            mediator.publish(VideoControlsStatusEvent.PauseSelected);
            this.__transitionToPausedStateNotFiringEvent();
        },

        __transitionToPausedStateNotFiringEvent: function () {
            this.__videoIsPlaying = false;
            this.setUIForPausedState();
        },

        __finished: function () {
            var sHistoryManager = HistoryManager.singleton();
            sHistoryManager.back();
        },

        __setProgressBar: function (rate) {
            if (rate >= 0 && rate <= 1 && this.__duration && rate * this.__duration >= 0) {
                this.__progressBar.getRoot().getHTMLElement().style.width = rate * 100 + "%";
            }
        },

        __setTime: function (time) {
            this.__currentTime = time;

            if (this.__duration) {
                this.__currentTimeLabel.setText(this.__formatTime(time));
                this.__durationLabel.setText(this.__formatTime(this.__duration));
            }
        },

        __formatTime: function (time) {
            time = Math.floor(time);

            var h = Math.floor(time / 3600),
                m = Math.floor(time % 3600 / 60),
                s = time % 60,
                hourLabel = "",
                doubleString = function (n) {
                    return (n < 10 ? "0" : "") + n;
                };

            if (h) {
                hourLabel = doubleString(h) + ":";
            }

            return hourLabel + doubleString(m) + ":" + doubleString(s);
        },

        __showUIWithoutFocus: function () {
            if (this.__status === "hidden") {
                this.__playerControllerContainer.removeClass("hidden");
                this.__mouseCloseButton.removeClass("hidden");
                this.__status = "show";
            }

            if (hideUITimer) {
                clearTimeout(hideUITimer);
            }

            hideUITimer = setTimeout(util.bind(this.__hideUI, this), AUTO_HIDE_TIMER);
        },

        __showUI: function () {
            this.__showUIWithoutFocus();

            if (mouseHandler.isMouseOn()) {
                return;
            }

            if (focusManager.getCurFocus() === this.__fullscreenFocus) {
                focusManager.focus(this.__playerButtonContainer);
                return;
            }

            focusManager.focus(focusManager.getLastActiveFocus());
        },

        __hideUI: function () {
            if (this.__status && this.__status !== "show") {
                return;
            }

            this.__hideQualityList();
            this.__playerControllerContainer.addClass("hidden");
            this.__mouseCloseButton.addClass("hidden");
            this.__status = "hidden";
            focusManager.focus(this.__fullscreenFocus);
        },

        updateTime: function (pos) {
            pos = pos > 0 ? pos : 0;

            this.__setTime(pos);
            this.__setProgressBar(this.__duration ? (pos / this.__duration) : 0);
        },

        setUIForPlayingState: function () {
            this.__showUI();
            this.__playOrPauseButton.addClass("icon-pause");
            this.__playOrPauseButton.removeClass("icon-play");
        },

        setUIForPausedState: function () {
            this.__playOrPauseButton.addClass("icon-play");
            this.__playOrPauseButton.removeClass("icon-pause");
        },

        setUIForStoppedState: function () {
            this.__finished();
        },

        onKey: function (evt) {
            if (evt.id !== vKey.BACK.id) {
                var hidden;

                if (this.__status && this.__status === "hidden") {
                    hidden = true;
                }

                this.__showUI();

                if (hidden) {
                    return false;
                }
            }

            switch (evt.id) {
            case vKey.PLAY.id:
                if (!this.__videoIsPlaying) {
                    this.__transitionToPlayingState();
                }
                break;

            case vKey.PAUSE.id:
                if (this.__videoIsPlaying) {
                    this.__transitionToPausedState();
                }
                break;

            case vKey.STOP.id:
                this.__transitionToPlayingStoppedEvent();
                break;

            case vKey.RW.id:
                this.__rewindButtonPressed();
                break;

            case vKey.FF.id:
                this.__fastForwardButtonPressed();
                break;

            case vKey.BACK.id:
                if (this.__qualityListIsShown) {
                    this.__hideQualityList();
                    break;
                }
                mediator.publish(VideoControlsStatusEvent.DismissSelected);
                return true;

            default:
                return true;
            }

            return false;
        },

        reset: function () {
            if (hideUITimer) {
                clearTimeout(hideUITimer);
            }

            mediator.unsubscribe(VideoPlaybackControlsEvent.SetControlsInPlayState, this.__setControlsInPlayStateRef);
            mediator.unsubscribe(VideoPlaybackControlsEvent.SetControlsInPauseState, this.__setControlsInPauseStateRef);
            mediator.unsubscribe(VideoPlaybackControlsEvent.SetControlsInBufferingState, this.__setControlsInBufferingStateRef);
            mediator.unsubscribe(VideoPlaybackControlsEvent.UpdatePlayheadState, this.__updatePlayheadStateRef);
            mediator.unsubscribe(VideoPlaybackControlsEvent.DismissControls, this.__dismissControlsRef);
            mediator.unsubscribe(VideoPlaybackControlsEvent.NotifyError, this.__notifyErrorRef);

            this.getView().removeEventListener(evtType.KEY, this.__onKeyRef);
            this.__rewindButton.removeEventListener(evtType.CLICK, this.__rewindButtonPressedRef);
            this.__playOrPauseButton.removeEventListener(evtType.CLICK, this.__playOrPauseButtonPressedRef);
            this.__fastForwardButton.removeEventListener(evtType.CLICK, this.__fastForwardButtonPressedRef);
            this.__settingButton.removeEventListener(evtType.CLICK, this.__settingButtonPressedRef);

            this.__mouseCloseButtonHTML.addEventListener("click", this.__mouseCloseButtonOnMouseClickRef);
            this.__playerBackgroundHTML.removeEventListener("click", this.__playerBackgroundOnMouseClickRef);
            this.__progressBarContainerHTML.removeEventListener("mouseover", this.__progressBarContainerOnMouseOverRef);
            this.__progressBarContainerHTML.removeEventListener("mouseout", this.__progressBarContainerOnMouseOutRef);
            this.__progressBarContainerHTML.removeEventListener("mousedown", this.__progressBarContainerOnMouseDownRef);
            document.removeEventListener("mouseup", this.__documentOnMouseUpRef);
            document.removeEventListener("mousemove", this.__documentOnMouseMoveRef);

            Loading.close();
            this.__buffering = false;
            this.__videoManager.deinit();
            AppRoot.singleton().getView().removeClass("fullscreen-video-mode");
        }
    });
});