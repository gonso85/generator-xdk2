/**
 * Returns a singleton of MenuManager. ManuManger controls the main menu and submenu data update.
 *
 * @class app/mgr/MenuManager
 */
define("app/mgr/MenuManager", [
    "app/mgr/AppConfigManager",
    "app/mgr/MessageDisplayHelper",
    "app/mgr/UserManager",
    "xdk-ax/data/LocalDatasource",
    "xdk-ax/evt/type",
    "xdk-ax/focusManager",
    "xdk-ax/mediator",
    "xdk-ax/mvc/AppRoot",
    "xdk-base/class",
    "xdk-base/promise",
    "xdk-base/util",
    "xdk-mouse/mouseHandler"
], function (
    AppConfigManager,
    MessageDisplayHelper,
    UserManager,
    LocalDatasource,
    evtType,
    focusManager,
    mediator,
    AppRoot,
    klass,
    promise,
    util,
    mouseHandler
) {

    var MenuManager,
        instance;

    MenuManager = klass.create({

        Event: {
            MenuItemUpdated: "MenuManagerEvent:MenuItemUpdated",
            SubmenuItemUpdated: "SubmenuManagerEvent:SubmenuItemUpdated"
        },

        /**
         * Get the singleton instance of this class.
         * @method
         * @static
         * @returns {app/mgr/MenuManager} The singleton
         * @memberof app/mgr/MenuManager#
         */
        singleton: function () {
            if (!instance) {
                instance = new MenuManager();
            }

            return instance;
        }
    }, {
        /**
         * Set the active main menu to be manipulated.
         * @method setMainMenu
         * @public
         * @param {app/wgt/MenuList} menuList the menu list
         * @param {Object} option
         * @return {Promise.<Undefined>} fulfilled with no return value
         * @memberof app/mgr/MenuManager#
         */
        setMainMenu: function (menuList, option) {
            if (this.__menuList === menuList) {
                return promise.resolve();
            }

            this.__menuList = menuList;
            this.__menuId = option.menuId;

            if (!this.__hasAddedSubscription) {
                this.__addSubscription();
            }

            menuList.addEventListener(evtType.FOCUS, util.bind(function () {
                this.__updateSubmenu();
            }, this));

            if (this.__submenuList) {
                this.__addSubmenuMouseBlurHandler();
            }

            return this.__getMainMenuDs().then(util.bind(function (menuDs) {
                if (menuDs === menuList.getDatasource()) {
                    return;
                }

                return menuList.setDatasource(menuDs).then(util.bind(function () {
                    if (this.__currentMenuStatus) {
                        menuList.selectItem(this.__currentMenuStatus);
                        return;
                    }

                    var item = {
                        newState: {
                            pageId: option.pageId
                        }
                    };

                    menuList.selectItem(item);
                    this.__currentMenuStatus = item;
                }, this));
            }, this));
        },

        /**
         * Set the active submenu to be manipulated
         * @method setSubmenu
         * @public
         * @param {app/wgt/SubmenuList} submenuList the menu list
         * @memberof app/mgr/MenuManager#
         */
        setSubmenu: function (submenuList) {
            this.__submenuList = submenuList;
        },

        /**
         * Get the current menu status
         * @method getCurrentMenuStatus
         * @public
         * @return {Object|null} the current menu status
         * @memberof app/mgr/MenuManager#
         */
        getCurrentMenuStatus: function () {
            return this.__currentMenuStatus || null;
        },

        /**
         * Get the current submenu status
         * @method getCurrentSubmenuStatus
         * @public
         * @return {Object|null} the current submenu status
         * @memberof app/mgr/MenuManager#
         */
        getCurrentSubmenuStatus: function () {
            return this.__currentSubmenuStatus || null;
        },

        __getSubmenuItems: function () {
            if (!this.__menuList) {
                return null;
            }

            var mainMenuItem = this.__menuList.getSelectedData();

            if (!mainMenuItem.items) {
                return null;
            }

            return mainMenuItem.items;
        },

        __updateSubmenu: function () {
            if (!this.__submenuList) {
                return promise.reject();
            }

            this.__submenuList.show();

            var submenuItems = this.__getSubmenuItems() || [];

            if (this.currentSubmenuItems === submenuItems) {
                this.__submenuList.getSelectedComp().setOption("focusable", true);
                this.__submenuList.getSelectedComp().setOption("forwardFocus", null);
                return promise.resolve();
            }

            //reset submenu position
            var submenuHTML = this.__submenuList.getRoot().getHTMLElement();
            submenuHTML.style.left = 0;

            this.currentSubmenuItems = submenuItems;

            var ds = new LocalDatasource(),
                dataLoader = function () {
                    return promise.resolve({
                        data: submenuItems,
                        total: submenuItems.length
                    });
                };

            ds.setDataLoader(dataLoader);

            return this.__submenuList.setDatasource(ds).then(util.bind(function () {
                this.__adjustSubmenuPosition();
                this.__submenuList.selectItem(this.__currentSubmenuStatus);
            }, this));
        },

        __adjustSubmenuPosition: function () {
            var selectedMenuItemHTML = this.__menuList.getSelectedComp().getRoot().getHTMLElement(),
                selectedMmenuItemClientRect = selectedMenuItemHTML.getBoundingClientRect(),
                selectedMenuItemLeft = (selectedMmenuItemClientRect.left + selectedMmenuItemClientRect.right) / 2;

            var submenuHTML = this.__submenuList.getRoot().getHTMLElement(),
                submenuWidth = submenuHTML.offsetWidth,
                submenuLeft = selectedMenuItemLeft - submenuWidth / 2;

            var appWidth = AppRoot.singleton().getView().getRoot().getHTMLElement().offsetWidth;

            if (submenuLeft + submenuWidth > appWidth) {
                submenuLeft = appWidth - submenuWidth;
            }

            if (submenuLeft < 0) {
                submenuLeft = 0;
            }

            submenuHTML.style.left = submenuLeft + "px";
        },

        __getMainMenuDs: function () {
            return AppConfigManager.singleton().getMenuItemsByMenuId(this.__menuId).then(util.bind(function (navigationItems) {
                var ds = new LocalDatasource(),
                    dataLoader = util.bind(function () {
                        var filteredItems = this.__filterItemsForCurrentState(navigationItems);

                        return promise.resolve({
                            data: filteredItems,
                            total: filteredItems.length
                        });
                    }, this);
                ds.setDataLoader(dataLoader);

                return ds;
            }, this), function (error) {
                MessageDisplayHelper.singleton().showError(error);
            });
        },

        __filterItemsForCurrentState: function (navigationItems) {
            var userState = UserManager.singleton().getUserState(),

                filterItems = function (items) {
                    var filteredItems = [];

                    for (var i = 0, l = items.length; i < l; i++) {
                        if (!items[i].state || items[i].state.indexOf(userState) > -1) {
                            if (items[i].items) {
                                items[i].items = filterItems(items[i].items);
                            }
                            filteredItems.push(items[i]);
                        }
                    }

                    return filteredItems;
                };

            return filterItems(navigationItems);
        },

        __addSubmenuMouseBlurHandler: function () {
            var menuList = this.__menuList,
                submenuList = this.__submenuList,
                onMenuBlur = function () {
                    util.delay(0).then(function () {
                        if (!focusManager.isCompChildFocused(submenuList) && !focusManager.isCompChildFocused(menuList)) {
                            submenuList.getSelectedComp().setOption("focusable", false);
                            submenuList.getSelectedComp().setOption("forwardFocus", menuList.getSelectedComp());
                            submenuList.hide();
                        }
                    });
                };

            menuList.addEventListener(evtType.BLUR, onMenuBlur);
            submenuList.addEventListener(evtType.BLUR, onMenuBlur);
        },

        __addSubscription: function () {
            this.__onUserSessionUpdatedRef = util.bind(this.__onUserSessionUpdated, this);
            this.__onMenuItemUpdatedRef = util.bind(this.__onMenuItemUpdated, this);
            this.__onSubmenuItemUpdatedRef = util.bind(this.__onSubmenuItemUpdated, this);

            mediator.subscribe(UserManager.Event.UserSessionUpdated, this.__onUserSessionUpdatedRef);
            mediator.subscribe(this.constructor.Event.MenuItemUpdated, this.__onMenuItemUpdatedRef);
            mediator.subscribe(this.constructor.Event.SubmenuItemUpdated, this.__onSubmenuItemUpdatedRef);

            this.__hasAddedSubscription = true;
        },

        __onUserSessionUpdated: function (userSession) {
            this.__getMainMenuDs().then(util.bind(function (menuDs) {
                this.__menuList.setDatasource(menuDs).then(util.bind(function () {
                    if (this.__currentMenuStatus) {
                        this.__menuList.selectItem(this.__currentMenuStatus);
                    }
                }, this));
            }, this)).done();
        },

        __onMenuItemUpdated: function (status) {
            this.__currentMenuStatus = status;
            this.__menuList.selectItem(status);
        },

        __onSubmenuItemUpdated: function (status) {
            this.__currentSubmenuStatus = status;
            this.__submenuList.selectItem(status);
        }
    });

    return MenuManager;
});