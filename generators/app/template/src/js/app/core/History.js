define([
    "xdk-base/class",
    "xdk-base/util",
    "xdk-ax/mvc/AppRoot",
    "xdk-ax/mvc/ControllerManager",
    "xdk-history/HistoryManager"
], function (
    klass,
    util,
    AppRoot,
    CtrlMgr,
    HistoryManager
) {
    "use strict";

    var instance = null,
        appRouter = null,
        superBack = null;

    function activate() {
        appRouter = require("app/core/appRouter");

        // register to AppRoot as default history handling
        AppRoot.singleton().setDefaultKeyAction(this._backKeys, util.bind(function () {
            appRouter.cancelCurrentNavigation();
            this.back();
        }, this));

        var sCtrlMgr = CtrlMgr.singleton();

        // listen to ControllerManager's events
        sCtrlMgr.addEventListener(CtrlMgr.EVT_REPLACED, util.bind(function (param) {

            // skip on doing history back
            if (param.options.__doHistoryBack) {
                return;
            }

            this._push({
                front: param.exist,
                frontContext: param.exist.getContextTree(),
                controller: param.replacement,
                options: param.options
            });
        }, this));

        sCtrlMgr.addEventListener(CtrlMgr.EVT_OPENED, util.bind(function (param) {

            // skip on doing history back
            if (param.options.__doHistoryBack) {
                return;
            }

            if (param.options.appRootFirstController) {
                // skip if opening first controller
                return;
            }

            this._push({
                front: null,
                controller: param.controller,
                options: param.options
            });
        }, this));

        sCtrlMgr.addEventListener(CtrlMgr.EVT_CLOSED, util.bind(function (param) {

            // skip on doing history back
            if (param.options.__doHistoryBack) {
                return;
            }

            this._push({
                front: param.controller,
                frontContext: param.controller.getContextTree(),
                controller: null,
                container: param.container,
                options: param.options
            });
        }, this));
    }

    function back(opts) {
        return superBack.call(this, opts)
            .then(util.bind(appRouter.setToLastDestination, appRouter));
    }

    return klass.create({

        singleton: function () {
            if (!instance) {
                instance = HistoryManager.singleton();
                // Monkey patch HistoryManager singleton instance instead, so
                // that any overrides / listeners added in XDK device packages
                // could be effective in Viki app.
                instance.activate = activate;
                superBack = instance.back;
                instance.back = back;
            }

            return instance;
        }

    }, {});
});
