/**
 * The main view's controller, setup the main menu, the subcontroller and the footer.
 * @name Main
 * @memberof app/ctrl
 * @class app/template/Main
 * @extends app/core/RoutableController
 */
define("app/template/main/MainCtrl", [
    "xdk-ax/evt/type",
    "xdk-ax/focusManager",
    "xdk-ax/mediator",
    "xdk-ax/mvc/view",
    "xdk-base/class",
    "xdk-base/config",
    "xdk-ui-basic/Layout",
    "xdk-base/promise",
    "xdk-base/util",
    "app/core/RoutableController",
    "app/mgr/AppConfigManager",
    "app/mgr/MenuManager",
    "./mainView"
], function (
    evtType,
    focusManager,
    mediator,
    view,
    klass,
    config,
    Layout,
    promise,
    util,
    RoutableController,
    AppConfigManager,
    MenuManager,
    mainView
) {
    "use strict";

    return klass.create(RoutableController, {}, {

        init: function () {
            var EmptySubCtrl = klass.create(RoutableController, {}, {
                init: function () {
                    this.setView(view.render({
                        klass: Layout
                    }));
                }
            });

            this.setView(view.render(mainView, EmptySubCtrl));
            this._super();
        },

        setup: function (context) {
            var currentView = this.getView(),
                sMenuManager = MenuManager.singleton(),
                mainMenu = currentView.find("mainMenu"),
                submenu = currentView.find("submenu");

            sMenuManager.setSubmenu(submenu);

            context.setupPending = AppConfigManager.singleton().getMainMenuEntryId().then(function (mainMenuEntryId) {
                var option = {
                    pageId: context.pageData.id,
                    menuId: mainMenuEntryId
                };

                return sMenuManager.setMainMenu(mainMenu, option).then(function () {
                    focusManager.focus(mainMenu);
                });
            });
        },

        retainView: function () {
            return true;
        }
    });
});
