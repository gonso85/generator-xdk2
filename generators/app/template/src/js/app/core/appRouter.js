/**
 * ###Introduction
 * App Router is used to navigate between the controllers
 * By setting the path, appRouter will automatically change into that page using controllerManager easily.
 *
 * ###To use the appRouter
 *
 * 1. Possible configuration in the xdk.config and app/core/nav/destinations
 * 2. Include the AppRounter in the apps.js
 * 3. All the controllers inside the application should be extended from the {@link app/ctrl/RoutableController}
 * 4. Use appRouter to navigate. The navigate function will return a promise after it completes.
 * E.g
 *       appRouter.navigate("TestDetail").then(function(){
 *          //to do when finish the navigation
 *       });
 *
 *
 * ###Flow
 * ####Assumption
 *
 * 1. Only one subcontroller inside a controller
 * 2. The path is predefined in app/core/nav/destinations
 *
 * @module app/core/appRouter
 */
/*
 * @name appRouter
 * @typedef {Object} config
 * @memberof app/mgr
 * @property {String} base The base path of the path.
 * @property {Object} paths  The speific path mapping of the controller
 */
define("app/core/appRouter", [
    "app/core/nav/destinations",
    "app/core/RoutableController",
    "app/mgr/MessageDisplayHelper",
    "app/mgr/UserManager",
    "require",
    "vdk/errors/VIAError",
    "vdk-loading/Loading",
    "xdk-ax/focusManager",
    "xdk-ax/mediator",
    "xdk-ax/mvc/AppRoot",
    "xdk-ax/mvc/ControllerManager",
    "xdk-base/config",
    "xdk-base/console",
    "xdk-base/core",
    "xdk-base/promise",
    "xdk-base/util"
], function (
    destinations,
    RoutableController,
    MessageDisplayHelper,
    UserManager,
    require,
    VIAError,
    Loading,
    focusMgr,
    mediator,
    AppRoot,
    ControllerManager,
    config,
    console,
    core,
    promise,
    util
) {

    var item,
        routerConfig = config.get("approuter", null),
        controllerList = {},
        controllerBasePath = "",
        processing = false,
        currentNavigation = null;

    //update the routable controller list mapping that path id to controller module id
    if (routerConfig) {
        if (!routerConfig.base) {
            throw core.createException("appRouter", "the base is not set.");
        }

        controllerBasePath = routerConfig.base;
        //update the list path to module ID
        if (routerConfig.paths) {
            for (item in routerConfig.paths) {
                controllerList[item] = routerConfig.paths[item];
            }
        }
    }
    /**
     * reset the processing state of current navigation
     * @private
     */
    function resetFromCancel() {
        processing = false;
        currentNavigation = null;
    }

    /**
     * Perform a single navigation step, change controller,
     * of given navigation
     * @private
     */
    function navigateStep(param, prevStepResult) {
        var option = {},
            NewController = param.page,
            state = param.state,
            message = param.message,
            historySkip = param.historySkip,
            currentController,
            navigated,
            subControllers;

        //if it have prev step result
        if (prevStepResult) {
            currentController = prevStepResult.currentController;
            navigated = prevStepResult.navigated;
        } else {
            currentController = AppRoot.singleton();
            navigated = false;
        }

        var stateSize = 0,
            messageSize = 0,
            targetContainer;

        subControllers = currentController.getSubControllers();

        if (navigated || historySkip) {
            option = {
                historySkip: true
            };
        }

        //populate context with state
        if (state) {
            option.context = util.extend(NewController.getDefaultRouteState(), state);
        } else {
            option.context = NewController.getDefaultRouteState();
        }

        // populate context with message
        if (message && util.keys(message).length > 0) {

            stateSize = util.keys(option.context).length;
            messageSize = util.keys(message).length;
            console.info("state keys: " + util.keys(option.context).join());
            console.info("message keys: " + util.keys(message).join());
            util.extend(option.context, message);

            // throw exception is there's a key overlap
            if (messageSize + stateSize !== util.keys(option.context).length) {
                return promise.reject(core.createException("appRouter", "Repeated item in state or context,"));
            }
        }

        option.historyFocus = focusMgr.getCurFocus();

        //if more than one subcontroller and do nothing
        if (subControllers.length > 1) {
            promise.reject(core.createException("appRouter", "IncorrectController ,the number of subcontroller is more than 1."));
        }

        if (!(NewController.prototype instanceof RoutableController)) {
            promise.reject(core.createException("appRouter", "the target Controller is not instance of RoutableController"));
        }

        //if no subcontroller then open a new controller
        if (subControllers.length === 0) {
            //set the state after open
            //get the target location.Default will be the currentController.getView();
            targetContainer = currentController.getSubRouteContainer ? currentController.getSubRouteContainer() : AppRoot.singleton().getView();

            return ControllerManager.singleton().open(NewController, targetContainer, option).then(function (currentController) {
                //wait for setup to complete
                return promise.when(option.context.setupPending, function () {

                    return {
                        navigated: true,
                        currentController: currentController
                    };

                });
            });
        }

        //if it has same controller and check the state
        if (subControllers[0] instanceof NewController) {
            if (matchedParam(subControllers[0], state) || subControllers[0].retainView()) {
                //do nothing
                return promise.resolve({
                    navigated: false,
                    currentController: subControllers[0]
                });
            }
        }

        //replace the current controller and set the state
        return ControllerManager.singleton().replace(subControllers[0], NewController, option).then(function (currentController) {
            //wait for setup to complete
            return promise.when(option.context.setupPending, function () {

                return {
                    navigated: true,
                    currentController: currentController
                };

            });
        });
    }

    /**
     * Handles a navigation request command
     * @private
     */
    function navigateEvtHandler(cmd) {
        var targetPath = cmd.destinations,
            i = 0,
            state = cmd.state || null,
            message = cmd.message || null,
            historySkip = cmd.historySkip || false,
            navigatePromise;

        //do nothing when processing back or processing navigation
        if (processing) {
            console.info("appRouter is processing. Further action is not allowed.");
            return promise.reject();
        }

        processing = true;

        Loading.open();

        //handle the controller by the target Path
        for (i = 0; i < targetPath.length; i++) {
            if (!navigatePromise) {
                navigatePromise = navigateStep({
                    page: targetPath[i],
                    state: state,
                    message: message,
                    historySkip: historySkip
                });
            } else {
                navigatePromise = navigatePromise.then(util.bind(navigateStep, null, {
                    page: targetPath[i],
                    state: state,
                    message: message,
                    historySkip: historySkip
                }));
            }
        }

        return navigatePromise.then(function () {
            mediator.publish("navigated", cmd);
            console.info("finish loading");
            return util.delay(0);
        }).complete(function () {
            Loading.close();
            processing = false;
        });
    }

    /**
     * Check if currentController is already in the state requested
     * @private
     */
    function matchedParam(currentController, targetParam) {
        //target then accept all cases
        if (!targetParam) {
            return true;
        }
        var item, currentParam = currentController.getRouteState();

        //to load the current state from the parent state
        for (item in targetParam) {
            if (!util.isUndefined(currentParam[item]) && currentParam[item] !== targetParam[item]) {
                return false;
            }
        }
        return true;
    }


    return {

        /**
         * The current destination
         * @memberof app/core/appRouter#
         * @private
         */
        __currentDestination: null,

        /**
         * All history destination
         * @memberof app/core/appRouter#
         * @private
         */
        __destinationHistoryStack: [],

        /**
         * Navigate to a view
         * @method navigate
         * @public
         * @param {String} dest the destination
         * @param {Object} opts more information to pass
         * @param {Object} [opts.state]  the state object
         * @param {Object} [opts.message] the message object
         * @param {Boolean}  [opts.historySkip] whether skip the history of the current page
         * @returns {Promise.<Undefined>} fulfilled with no return value
         * @memberof app/core/appRouter#
         */
        navigate: function (dest, opts) {
            opts = opts || {};

            if (!destinations[dest]) {
                return promise.reject(new VIAError(VIAError.FACILITY.GENERAL, VIAError.ERROR.INVALID, "Wrong destination: " + dest));
            }

            if (opts.state && opts.state.pageData && opts.state.pageData.state) {
                var pageState = opts.state.pageData.state,
                    userState = UserManager.singleton().getUserState();

                if (pageState.indexOf(userState) === -1) {
                    return promise.reject(new VIAError(VIAError.FACILITY.GENERAL, VIAError.ERROR.INVALID, "Wrong state."));
                }
            }

            currentNavigation = navigateEvtHandler({
                destinations: destinations[dest],
                state: opts.state || null,
                message: opts.message || null,
                historySkip: opts.historySkip || false
            }).then(util.bind(function () {
                    if(this.__currentDestination){
                        this.__destinationHistoryStack.push(this.__currentDestination);
                    }

                    this.__currentDestination = dest;
                    currentNavigation = null;
                    return;
                }, this),
                null,
                function () {
                    resetFromCancel();
                });

            return currentNavigation;
        },

        /**
         * Get the current destination
         * @method getCurrentDestination
         * @public
         * @returns {String} the destination
         * @memberof app/core/appRouter#
         */
        getCurrentDestination: function () {
            return this.__currentDestination;
        },

        /**
         * Compare two destinations, to see if they are same
         * @method destinationEquals
         * @public
         * @param {Object} destinationA the first NavigationDestination to compare
         * @param {Object} destinationB  the second NavigationDestination to compare
         * @returns {Boolean} if the two destinations are same
         * @memberof app/core/appRouter#
         */
        destinationEquals: function (destinationA, destinationB) {
            if (destinationA.destination !== destinationB.destination) {
                return false;
            }

            if (!destinationA.newState && !destinationB.newState) {
                return true;
            }

            var newStateA = destinationA.newState,
                newStateB = destinationB.newState;

            for (var i in newStateA) {
                if (!newStateA.hasOwnProperty(i)) {
                    continue;
                }

                if (!newStateB.hasOwnProperty(i)) {
                    return false;
                }

                if (newStateA[i] === newStateB[i]) {
                    continue;
                }

                if (!util.isPlainObject(newStateA[i])) {
                    return false;
                }
            }

            for (i in newStateB) {
                if (newStateB.hasOwnProperty(i) && !newStateA.hasOwnProperty(i)) {
                    return false;
                }
            }

            return true;
        },
        /**
         * Cancel the processing navigation.
         *
         * @method cancelCurrentNavigation
         * @public
         * @memberof app/core/appRouter#
         */
        cancelCurrentNavigation: function () {
            if (currentNavigation) {
                currentNavigation.cancel();
            }
        },

        /**
         * Set to last destination if there is one.
         *
         * @method setToLastDestination
         * @public
         * @memberof app/core/appRouter#
         */
        setToLastDestination: function(){
            this.__currentDestination = this.__destinationHistoryStack.pop();
        }
    };
});