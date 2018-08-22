/**
 * The main menu of the app, will be set dynamically by user login/logout.
 *
 * @class app/wgt/MenuList
 * @extends xdk-ui-basic/ScrollingGrid
 */
define("app/wgt/MenuList", [
    "app/core/RoutableController",
    "app/mgr/MenuManager",
    "app/mgr/MessageDisplayHelper",
    "app/wgt/MainMenuButton",
    "vdk/errors/VIAError",
    "xdk-ax/evt/type",
    "xdk-ax/mediator",
    "xdk-base/class",
    "xdk-base/core",
    "xdk-base/exception",
    "xdk-base/util",
    "xdk-ui-grid/ScrollingGrid"
], function (
    RoutableController,
    MenuManager,
    MessageDisplayHelper,
    MainMenuButton,
    VIAError,
    evtType,
    mediator,
    klass,
    core,
    exception,
    util,
    ScrollingGrid
) {
    return klass.create(ScrollingGrid, {}, {

        init: function (opts) {
            this._super(opts);

            var appRouter = RoutableController.getAppRouter();

            this.setDisplayStgy(util.bind(function (data) {
                var button = new MainMenuButton({
                    text: data.title
                });

                button.addEventListener(evtType.CLICK, function () {
                    if (data.navigationDestination) {
                        mediator.publish(MenuManager.Event.MenuItemUpdated, data.navigationDestination);
                        mediator.publish(MenuManager.Event.SubmenuItemUpdated, null);
                        appRouter.navigate(data.navigationDestination.destination, {
                            state: data.navigationDestination.newState || null
                        }).fail(function (error) {
                            var viaError = new VIAError(VIAError.FACILITY.GENERAL, VIAError.ERROR.INVALID, "Failed to navigate.");
                            MessageDisplayHelper.singleton().showError(viaError);
                            throw error;
                        }).done();
                    }else if(data.action){
                        alert(data.action.actionId);
                    }
                });

                button.data = data;
                this.__addButton(button);

                if (this.__lastSelection) {
                    if (this.__lastSelection.data === data) {
                        button.select();
                        this.__lastSelection = button;
                    }
                }

                return button;
            }, this));
        },

        /**
         * Selete the item by given route
         * @method selectItem
         * @public
         * @param {Object} route the route object of the menu item.
         * @param {String} [route.destination] the destination of the item
         * @param {Object} [route.newState] the new state of the item's destination
         * @throws {Exception.<exception.ILLEGAL_ARGUMENT>} when the route is invalid
         * @memberof app/wgt/MenuList#
         */
        selectItem: function (route) {
            if (!route) {
                throw core.createException(exception.ILLEGAL_ARGUMENT, "No route provided.");
            }

            var selection = this.__getButton(route.destination, route.newState);

            if (this.__lastSelection && this.__lastSelection !== selection) {
                this.__lastSelection.unselect();
            }

            if (selection) {
                selection.select();
            }

            this.__lastSelection = selection;
        },

        __addButton: function (newButton) {
            this.__buttons = this.__buttons || [];

            for (var i = 0, l = this.__buttons.length; i < l; i++) {
                var button = this.__buttons[i],
                    buttonData = button.data,
                    newButtonData = newButton.data,
                    appRouter = RoutableController.getAppRouter();

                if (buttonData.navigationDestination && newButtonData.navigationDestination) {
                    if (appRouter.destinationEquals(buttonData.navigationDestination, newButtonData.navigationDestination)) {
                        this.__buttons[i] = newButton;
                        return;
                    }
                }

                if (!button.data.submenu || !newButton.data.submenu) {
                    continue;
                }

                buttonData = button.data.submenu[0];
                newButtonData = newButton.data.submenu[0];

                if (buttonData.navigationDestination && newButtonData.navigationDestination) {
                    if (appRouter.destinationEquals(buttonData.navigationDestination, newButtonData.navigationDestination)) {
                        this.__buttons[i] = newButton;
                        return;
                    }
                }
            }

            this.__buttons.push(newButton);
        },

        __getButton: function (routeDestination, state) {
            for (var i = 0, l = this.__buttons.length; i < l; i++) {
                var button = this.__buttons[i],
                    navigationDestination = {
                        destination: routeDestination,
                        newState: state
                    };

                if (button.data.navigationDestination) {
                    if (button.data.navigationDestination.newState.pageId === navigationDestination.newState.pageId) {
                        return button;
                    }
                }

                if (button.data.items) {
                    var submenu = button.data.items;
                    for (var ii = 0, ll = submenu.length; ii < ll; ii++) {
                        if (submenu[ii].navigationDestination.newState.pageId === navigationDestination.newState.pageId) {
                            if (!routeDestination) {
                                mediator.publish(MenuManager.Event.SubmenuItemUpdated, submenu[ii].navigationDestination);
                            }
                            return button;
                        }
                    }
                }
            }
        }
    });
});