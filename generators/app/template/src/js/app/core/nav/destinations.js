//You should register your own controllers here, e.g. MovieDetailsCtrl, SettingCtrl, LoginCtrl, etc.
define("app/core/nav/destinations", [
    "app/template/fullscreenPlayer/FullscreenPlayerCtrl",
    "app/template/main/MainCtrl",
    "app/template/maintenance/MaintenanceCtrl",
    "app/template/sample/SampleCtrl",
    "app/template/template1/Template1Ctrl",
    "app/template/template2/Template2Ctrl",
    "app/template/template3/Template3Ctrl",
    "app/template/template4/Template4Ctrl"
], function (
    FullscreenPlayerCtrl,
    MainCtrl,
    MaintenanceCtrl,
    SampleCtrl,
    Template1Ctrl,
    Template2Ctrl,
    Template3Ctrl,
    Template4Ctrl
) {


    return {

        "TEMPLATE1": [MainCtrl, Template1Ctrl],

        "TEMPLATE2": [MainCtrl, Template2Ctrl],

        "TEMPLATE3": [MainCtrl, Template3Ctrl],

        "TEMPLATE4": [MainCtrl, Template4Ctrl],

        "SAMPLE": [MainCtrl, SampleCtrl],

        "MAINTENANCE": [MaintenanceCtrl],

        "FULLSCREEN": [FullscreenPlayerCtrl],

        "FULLSCREEN_PLAYER": [FullscreenPlayerCtrl],


        //template name defined in AppGrid
        "default": [MainCtrl, SampleCtrl],

        "home": [MainCtrl, SampleCtrl],

        "kids": [MainCtrl, SampleCtrl],

        "starwars": [MainCtrl, SampleCtrl],

        "dark": [MainCtrl, SampleCtrl],

        "epg":  [MainCtrl, SampleCtrl]
    };
});