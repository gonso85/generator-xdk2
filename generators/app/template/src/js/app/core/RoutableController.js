/**
 * The routable controller which is extended by most controllers in VIA App.
 * @name RoutableController
 * @memberof app/core
 * @class app/core/RoutableController
 * @extends app/ctrl/Controller
 */
define("app/core/RoutableController", [
    "app/mgr/MenuManager",
    "xdk-base/class",
    "xdk-ax/focusManager",
    "xdk-ax/mediator",
    "xdk-ax/mvc/Controller",
    "xdk-base/console",
    "xdk-base/promise",
    "xdk-base/util",
    "require"
], function (
    MenuManager,
    klass,
    focusMgr,
    mediator,
    Controller,
    console,
    promise,
    util,
    require
) {

    var RoutableController = klass.create(Controller, {
        /**
         * To obtain the default state of the routable controller. Developer need to overlap with this function to set the default.
         * @return {Object} the State object. Default will be {}
         * @memberof app/core/RoutableController
         * @method getDefaultRouteState
         * @public
         */
        getDefaultRouteState: function () {
            return {};
        },

        /**
         * To get the app router which can navigate views.
         * @return {app/core/appRouter} the app router
         * @memberof app/core/RoutableController
         * @method getAppRouter
         * @public
         */
        getAppRouter: function () {
            return require("app/core/appRouter");
        }
    }, {
        /**
         * Store the stateeter for the controller
         * @name __state
         * @private
         * @memberof app/core/RoutableController#
         */
        __state: {},


        //Store the focus for history back
        __historyFocus: null,

        init: function (opts) {
            // init with defaultState
            this.__state = this.constructor.getDefaultRouteState();

            this._super(opts);
        },

        setup: function (context) {
            this._super(context);
            this.getRouteState().pageId = context.pageId || "";
            this.getRouteState().pageData = context.pageData || null;

            if (context.historyBack) {
                mediator.publish(MenuManager.Event.MenuItemUpdated, this.__menuStatus);
                mediator.publish(MenuManager.Event.SubmenuItemUpdated, this.__submenuStatus);
            } else {
                this.__menuStatus = MenuManager.singleton().getCurrentMenuStatus();
                this.__submenuStatus = MenuManager.singleton().getCurrentSubmenuStatus();
            }
        },

        setView: function (view) {

            this._super(view);

            view.setOption("forwardFocus", true);
        },

        getContext: function () {

            var context = util.clone(this.getRouteState());

            return context;
        },
        /**
         * Get the state of the current controller which will be extended from the default state
         * @return {Object} the stateeter set for the path.
         * @method getRouteState
         * @memberof app/core/RoutableController#
         * @public
         */
        getRouteState: function () {
            return this.__state;
        },
        /**
         * Helper function to get the Parent Path
         * @return {app/core/RoutableController}the Controller itself
         * @memberof app/core/RoutableController#
         * @method getAncestorsRouteState
         * @public
         */
        getAncestorsRouteState: function () {
            var currentParam = this.getRouteState(),
                targetController = this.getParentController();

            //loop the parent and extend the state from the parent
            while (targetController && targetController instanceof RoutableController) {
                currentParam = util.extend(currentParam, targetController.getRouteState());
                targetController = targetController.getParentController();
            }

            return currentParam;
        },

        /**
         * Helper function to return extended the Parent Path state
         * @param {Object} state
         * @return {Object} extended state
         * @memberof app/core/RoutableController#
         * @method extendPathStates
         * @public
         */
        extendPathStates: function (state) {
            return util.extend(state, this.getAncestorsRouteState());
        },
        /**
         * Set the state, which should be set after the controller is created
         * @return {app/core/RoutableController}the Controller itself
         * @memberof app/core/RoutableController#
         * @method updateState
         * @public
         */
        updateState: function (state) {
            var defaultState = this.constructor.getDefaultRouteState(),
                i;
            for (i in state) {
                if (util.isUndefined(defaultState[i])) {
                    console.error("Unmatched state. All the state should be predefined with a default State by getDefaultRouteState function.");
                }
            }

            this.__state = util.clone(state, true);
            return this;

        },
        /**
         * For open controller, to set where to place the controller. When replace controller, it will use the original places instead of setting a new position.
         * @return {xdk-ax/Container} the container to be attched with the controller. Default will be the current Controller View
         * @memberof app/core/RoutableController#
         * @method getSubRouteContainer
         * @public
         */
        getSubRouteContainer: function () {
            return this.getView();
        },

        /**
         * Get result of whether to retain the same view instead of recreating the view
         * @param {Object} state
         * @return {Boolean} Whether to retain the same view instead of recreating the view
         * @memberof app/core/RoutableController#
         * @method retainView
         * @public
         */
        retainView: function (state) {
            return false;
        },

        _setupSubtree: function (context) {

            var i = 0,
                len = this._subControllers.length,
                subController, subCtrlrId,
                subContext,
                pendingSubcontrollers = [],
                pending;

            this.setup(context);

            //setup sub controllers if context.subContexts[controllerId] exists
            for (; i < len; i++) {
                subController = this._subControllers[i];
                subCtrlrId = subController.getId();

                if (context && context.subContexts && context.subContexts[subCtrlrId]) {
                    subContext = context.subContexts[subCtrlrId];
                } else {
                    subContext = {};
                }

                subContext = util.extend(subContext, context);
                if (context.setupPending) {

                    //wait for parent controller to finish setup
                    pendingSubcontrollers.push(context.setupPending.then(function () {
                        return subController._setupSubtree(subContext);
                    }));
                } else {

                    pendingSubcontrollers.push(
                        subController._setupSubtree(subContext)
                    );

                }
            }

            pending = pendingSubcontrollers.length > 0 ? promise.all(pendingSubcontrollers) : context.setupPending;

            if (this.postSetup) {

                if (pending) {
                    pending.then(util.bind(function () {
                        this.postSetup(context);
                    }, this));
                }

                return promise.resolve(this.postSetup(context));
            }

            return promise.resolve(true);

        }
    });

    return RoutableController;
});