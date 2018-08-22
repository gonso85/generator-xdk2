/**
 * The submenu.
 *
 * @class app/wgt/SubmenuList
 * @extends xdk-ui-basic/ScrollingGrid
 */
define("app/wgt/SubmenuList", [
    "app/core/RoutableController",
    "app/mgr/MenuManager",
    "app/mgr/MessageDisplayHelper",
    "app/wgt/MenuList",
    "xdk-ax/evt/type",
    "xdk-ax/focusManager",
    "xdk-ax/mediator",
    "xdk-base/class",
    "xdk-base/core",
    "xdk-base/exception",
    "xdk-base/util",
    "xdk-ui-basic/Button"
], function (
    RoutableController,
    MenuManager,
    MessageDisplayHelper,
    MenuList,
    evtType,
    focusManager,
    mediator,
    klass,
    core,
    exception,
    util,
    Button
) {

    return klass.create(MenuList, {}, {

        __buttons: [],

        init: function (opts) {
            this._super(opts);

            this.addClass("wgt-submenu");

            this.setDisplayStgy(function (data) {
                var button = new Button({
                    text: data.title
                });

                button.addEventListener(evtType.CLICK, function () {
                    if (data.navigationDestination) {
                        mediator.publish(MenuManager.Event.MenuItemUpdated, data.parent.navigationDestination);
                        mediator.publish(MenuManager.Event.SubmenuItemUpdated, data.navigationDestination);

                        RoutableController.getAppRouter().navigate(data.navigationDestination.destination, {
                            state: data.navigationDestination.newState || null
                        }).fail(function (error) {
                            MessageDisplayHelper.singleton().showError(error);
                        }).done();
                    }
                }).removeClass("wgt-button").addClass("menu-button");

                button.data = data;
                this.__addButton(button);

                if (this.__lastSelection) {
                    if (this.__lastSelection.data === data) {
                        button.addClass("selected");
                        this.__lastSelection = button;
                    }
                }

                return button;
            });
        },

        /**
         * Selete the item by given route
         * @method selectItem
         * @public
         * @param {Object} route the route object of the submenu item.
         * @param {String} [route.destination] the destination of the submenu item
         * @param {Object} [route.newState] the new state of the submenu item's destination
         * @throws {Exception.<exception.ILLEGAL_ARGUMENT>} when the route is invalid
         * @memberof app/wgt/SubmenuList#
         */
        selectItem: function (route) {
            if (!route) {
                if (this.__lastSelection) {
                    this.__lastSelection.removeClass("selected");
                    this.__lastSelection = null;
                }
                return;
            }

            var selection = this.__getButton(route.destination, route.newState);

            if (this.__lastSelection && this.__lastSelection !== selection) {
                this.__lastSelection.removeClass("selected");
            }

            if (selection && !selection.getRoot().hasClass("selected")) {
                selection.addClass("selected");
            }

            this.__lastSelection = selection;
        },

        __getButton: function (routeDestination, state) {
            for (var i = 0, l = this.__buttons.length; i < l; i++) {
                var navigationDestination = this.__buttons[i].data.navigationDestination,
                    __navDest = {
                        destination: routeDestination,
                        newState: state
                    };

                if (navigationDestination) {
                    if (navigationDestination.newState.pageId === __navDest.newState.pageId) {
                        return this.__buttons[i];
                    }
                }
            }

            return null;
        }
    });
});