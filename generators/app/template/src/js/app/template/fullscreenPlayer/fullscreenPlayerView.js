define("app/template/fullscreenPlayer/fullscreenPlayerView", [
    "xdk-ax/Container",
    "xdk-ui-basic/Button",
    "xdk-ui-grid/BoundedGrid",
    "xdk-ui-basic/Label",
    "xdk-ui-basic/Layout"
], function (
    Container,
    Button,
    Grid,
    Label,
    Layout
) {
    return function () {
        return {
            klass: Container,
            id: "#fullscreenPlayerView",
            forwardFocus: "playerButtonContainer",
            children: [

                {
                    klass: Container,
                    id: "playerBackground",
                    css: "player-background"
                },

                {
                    klass: Button,
                    id: "#mouseCloseButton"
                },

                {
                    klass: Container,
                    id: "playerControllerContainer",
                    css: "player-controller-container",
                    children: [

                        {
                            klass: Label,
                            id: "currentTime",
                            css: "current-time noselect"
                        },

                        {
                            klass: Container,
                            id: "progressBarContainer",
                            css: "progress-bar-container",
                            clickable: true,
                            children: [

                                {
                                    klass: Container,
                                    id: "progressBar",
                                    css: "progress-bar"
                                },

                                {
                                    klass: Container,
                                    id: "progressPoint",
                                    css: "progress-point"
                                },

                                {
                                    klass: Container,
                                    id: "pointerTimeContainer",
                                    css: "point-time-container",
                                    children: [

                                        {
                                            klass: Label,
                                            id: "pointerTime",
                                            css: "pointer-time  noselect"
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            klass: Label,
                            id: "duration",
                            css: "duration noselect"
                        },

                        {
                            klass: Container,
                            id: "playerButtonContainer",
                            css: "player-button-container",
                            alignment: Layout.HORIZONTAL,
                            forwardFocus: "playOrPause",
                            children: [

                                {
                                    klass: Button,
                                    id: "rewind",
                                    css: "icon-backward",
                                    nextRight: "playOrPause"
                                },

                                {
                                    klass: Button,
                                    id: "playOrPause",
                                    css: "icon-play",
                                    nextLeft: "rewind",
                                    nextRight: "fastForward"
                                },

                                {
                                    klass: Button,
                                    id: "fastForward",
                                    css: "icon-forward",
                                    nextLeft: "playOrPause",
                                    nextRight: "setting"
                                },

                                {
                                    klass: Button,
                                    id: "setting",
                                    css: "icon-cog",
                                    nextLeft: "fastForward",
                                    nextRight: null
                                }
                            ]
                        }
                    ]
                },

                {
                    klass: Button,
                    id: "fullscreenFocus",
                    focusable: true
                }
            ]
        };
    };
});