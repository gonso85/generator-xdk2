/**
 * Returns a singleton to provide most AppGrid related methods in business layer.
 * @name AppConfigManager
 * @class app/mgr/AppConfigManager
 */
define("app/mgr/AppConfigManager", [
    "app/core/nav/DestinationParserManager",
    "app/service/ServiceHolder",
    "vdk/errors/VIAError",
    //"vdk-lib-i18next/i18next", //add the dependency, remove the comments to use the i18next module
    "xdk-base/ajax",
    "xdk-base/class",
    "xdk-base/config",
    "xdk-base/console",
    "xdk-base/device",
    "xdk-base/device/shared/LocalStorage",
    "xdk-base/promise",
    "xdk-base/util",
    "json!failover=true|map.json"
], function (
    DestinationParserManager,
    ServiceHolder,
    VIAError,
    //i18next, //add the dependency, remove the comments to use the i18next module
    ajax,
    klass,
    config,
    console,
    device,
    LocalStorage,
    promise,
    util,
    localAppConfig
) {
    var USE_LOCAL_CONFIG = "LOCAL";

    var AppConfigManager,
        instance;

    AppConfigManager = klass.create({

        STATUS: {
            ACTIVE: "active",
            MAINTENANCE: "maintenance",
            OFFLINE: "offline"
        },

        /**
         * Get the singleton instance of this class.
         * @method
         * @static
         * @returns {app/mgr/AppConfigManager} The singleton
         * @memberof app/mgr/AppConfigManager#
         */
        singleton: function () {
            if (!instance) {
                instance = new AppConfigManager();
            }

            return instance;
        }
    }, {

        /**
         * Get the app status through status service.
         * @method getStatus
         * @public
         * @returns {Promise.<String>} a string to tell the status
         * @memberof app/mgr/AppConfigManager#
         */
        getStatus: function () {
            var statusService = ServiceHolder.singleton().getStatusService();

            if (statusService) {
                return statusService.getStatus();
            }

            //the app status will be active forever if there isn't a status checking service
            return promise.resolve(this.constructor.STATUS.ACTIVE);
        },

        /**
         * Get the app message through status service.
         * @method getMessage
         * @public
         * @returns {Promise.<String>} the message about the current status
         * @memberof app/mgr/AppConfigManager#
         */
        getStatusMessage: function () {
            var statusService = ServiceHolder.singleton().getStatusService();

            if (statusService) {
                return statusService.getMessage();
            }

            return promise.resolve("");
        },

        /**
         * Get the sitemap data. The sitemap may be from local, AppGrid or other server.
         * @method getSitemap
         * @public
         * @returns {Promise.<Object>} the sitemap data
         * @memberof app/mgr/AppConfigManager#
         */
        getSitemap: function () {
            if (this.__sitemap) {
                return promise.resolve(this.__sitemap);
            }

            if (config.get("app.config") === USE_LOCAL_CONFIG) {
                this.__sitemap = localAppConfig;
                return promise.resolve(localAppConfig);
            }

            return this.__getSitemapFromAppGridCMS();
        },

        /**
         * Get landing page entry id. The id be from local or AppGrid CMS.
         * @method getLandingPageEntryId
         * @public
         * @returns {Promise.<string>} id
         * @memberof app/mgr/AppConfigManager#
         */
        getLandingPageEntryId: function(){
            if (config.get("app.config") === USE_LOCAL_CONFIG) {
                return promise.resolve(config.get("local").landingPageEntryId);
            }

            return this.__getAllAppConfigs().then(function(data){
                return data.landingPageEntryId;
            });
        },

        /**
         * Get main menu entry id. The id be from local or AppGrid CMS.
         * @method getMainMenuEntryId
         * @public
         * @returns {Promise.<string>} id
         * @memberof app/mgr/AppConfigManager#
         */
        getMainMenuEntryId: function(){
            if (config.get("app.config") === USE_LOCAL_CONFIG) {
                return promise.resolve(config.get("local").mainMenuEntryId);
            }

            return this.__getAllAppConfigs().then(function(data){
                return data.mainMenuEntryId;
            });
        },

        __getSitemapFromAppGridCMS: function () {
            if (this.__getSitemapFromAppGridCMSPromise) {
                return this.__getSitemapFromAppGridCMSPromise;
            }

            var configurationService = ServiceHolder.singleton().getConfigurationService();

            //when you have tons of entries, getAllEntries may block the app initialization,
            //you probabley shoule use different ways to get the sitemap info from AppGrid CMS.
            //e.g. getEntriesByEntryTypeId
            //Please check available CMS functions in vdk-appGrid/AppGridService.
            this.__getSitemapFromAppGridCMSPromise = configurationService
                .getAllEntries({
                    size: 50
                })
                .then(util.bind(function (data) {
                    this.__sitemap = this.__convertCMSDataToSitemap(data);
                    return this.__sitemap;
                }, this))
                .complete(util.bind(function () {
                    this.__getSitemapFromAppGridCMSPromise = null;
                }, this));

            return this.__getSitemapFromAppGridCMSPromise;
        },

        __convertCMSDataToSitemap: function (data) {
            var CMSType = config.get("appgrid").CMS.type,
                defaultCMSMenuId = config.get("appgrid").CMS.defaultMenuId,
                vdkPagePrefix = "vdk://page/",
                vdkActionPrefix = "vdk://action/",
                sitemap = {
                    config_pages: [],
                    config_containers: [],
                    config_menus: [],
                    config_items: []
                },
                itemsInAllMenus = [],
                itemsInOneMenu,
                menu, entry, item, i, l;

            for (i = 0, l = data.entries.length; i < l; i++) {
                entry = data.entries[i];
                item = util.extend(entry, entry._meta);

                switch (item.typeId) {

                case CMSType["Container"]:
                    sitemap.config_containers.push(item);
                    break;

                case CMSType["Item"]:
                    sitemap.config_items.push(item);
                    break;

                case CMSType["Menu"]:
                    item.template = item.typeId;
                    sitemap.config_menus.push(item);
                    break;

                case CMSType["MenuItem"]:
                    if (item.page) {
                        item.action = vdkPagePrefix + item.page;
                        itemsInAllMenus.push(item);
                    }else if(item.action){

                        item.action = vdkActionPrefix +
                                      item.action +
                                      (item.actiondata ? "?" + item.actiondata : "");
                        itemsInAllMenus.push(item);
                    }
                    break;

                case CMSType["Page"]:
                    item.template = item.template;
                    sitemap.config_pages.push(item);
                    break;

                default:
                    break;
                }
            }

            for (i = 0, l = sitemap.config_menus.length; i < l; i++) {
                menu = sitemap.config_menus[i];
                itemsInOneMenu = [];

                for (var ii = 0, ll = menu.items.length; ii < ll; ii++) {
                    var menuId = menu.items[ii];
                    for(var iii = 0, lll = itemsInAllMenus.length; iii < lll; iii++){
                        if(itemsInAllMenus[iii].id === menuId){
                            itemsInOneMenu.push(itemsInAllMenus[iii]);
                        }
                    }
                }

                menu.items = itemsInOneMenu;
            }

            return sitemap;
        },

        /**
         * Get menu navigation metadata and parse them into menu item objects.
         * @method getNavigationItems
         * @public
         * @param {String} navId the nav group id
         * @returns {Promise.<Object>} the parsed menu items
         * @memberof app/mgr/AppConfigManager#
         */
        getMenuItemsByMenuId: function (menuId) {
            var parseItems = function (items, parent) {
                var menuNavigations = util.clone(items, true),
                    menuNavigation,
                    menuItem,
                    menuItems = [],
                    sDestinationParserManager = DestinationParserManager.singleton();

                for (var i = 0, l = menuNavigations.length; i < l; i++) {
                    menuNavigation = menuNavigations[i];
                    if (!menuNavigation.action || !menuNavigation.id || !menuNavigation.title) {
                        throw new VIAError(VIAError.FACILITY.CONFIGURATION_SERVICE, VIAError.ERROR.INVALID, "menu item doesn't have action, id or title.");
                    }

                    menuItem = {};
                    menuItem.id = menuNavigation.id;
                    menuItem.title = menuNavigation.displaytext || menuNavigation.displayText || menuNavigation.title;
                    menuItem.order = i;

                    var parsedResult = sDestinationParserManager.parseFrom(menuNavigation.action);

                    if(parsedResult.destination){
                        menuItem.navigationDestination = parsedResult;
                    }else if(parsedResult.actionId){
                        menuItem.action = parsedResult;
                    }

                    if (menuNavigation.state && !util.isArray(menuNavigation.state)) {
                        menuItem.state = menuNavigation.state.split("&");
                    } else {
                        menuItem.state = menuNavigation.state;
                    }

                    if (parent) {
                        menuItem.parent = parent;
                    }

                    if (menuNavigation.items) {
                        var subItem = menuNavigation.items[0];
                        //There might be empty item on AppGrid
                        if (subItem.action && subItem.id && subItem.title) {
                            menuItem.items = parseItems(menuNavigation.items, menuItem);
                        }
                    }

                    menuItems[i] = menuItem;
                }

                return menuItems;
            };

            return this.__getMenuMetadataByMenuId(menuId).then(util.bind(function (nav) {
                if (!nav || !nav.items) {
                    throw new VIAError(VIAError.FACILITY.CONFIGURATION_SERVICE, VIAError.ERROR.INVALID, "The app cannot get navigation items.");
                }

                var menuItems = parseItems(nav.items);
                return menuItems;
            }, this));
        },

        /**
         * Get all pages metadata.
         * @method getPagesMetadata
         * @public
         * @returns {Promise.<Array>} the pages metadata
         * @memberof app/mgr/AppConfigManager#
         */
        getPagesMetadata: function () {
            return this.getSitemap().then(function (data) {
                var pages = data.config_pages || [];

                //the state of pages will be separated by "&" on AppGrid
                if (config.get("app.config") !== USE_LOCAL_CONFIG) {
                    for (var i = 0, l = pages.length; i < l; i++) {
                        if (pages[i].state && !util.isArray(pages.state)) {
                            pages[i].state = pages[i].state.split("&");
                        }
                    }
                }

                return pages;
            });
        },

        /**
         * Get one page metadata by given id
         * @method getPageMetadataById
         * @public
         * @param {String} id the page id
         * @returns {Promise.<Object>} the page metadata
         * @memberof app/mgr/AppConfigManager#
         */
        getPageMetadataById: function (id) {
            return this.getPagesMetadata().then(function (pages) {
                for (var i = 0, l = pages.length; i < l; i++) {
                    if (pages[i].id === id) {
                        return pages[i];
                    }
                }
            });
        },

        /**
         * Get container metadata by given id
         * @method getBandMetadataById
         * @public
         * @param {String} id the container id
         * @returns {Promise.<Object|null>} the container metadata
         * @memberof app/mgr/AppConfigManager#
         */
        getContainerMetadataById: function (id) {
            return this.getSitemap().then(function (data) {
                var containers = data.config_containers;

                for (var i = 0, l = containers.length; i < l; i++) {
                    if (containers[i].id === id) {
                        return containers[i];
                    }
                }

                return null;
            });
        },

        /**
         * Get containers metadata by given ids
         * @method getBandMetadataByIds
         * @public
         * @param {String[]} ids the band ids
         * @returns {Promise.<Array|null>} the containers metadata
         * @memberof app/mgr/AppConfigManager#
         */
        getContainersMetadataByIds: function (ids) {
            return this.getSitemap().then(function (data) {
                var containers = data.config_containers,
                    ret = [],
                    i,
                    l = ids.length,
                    ll = containers.length,
                    ii,
                    found;

                for (i = 0; i < l; i++) {

                    for (ii = 0; ii < ll; ii++) {
                        if (containers[ii].id === ids[i]) {
                            ret.push(containers[ii]);
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        ret.push(null);
                    }
                }

                return ret;
            });
        },

        /**
         * Get all messages config
         * @method getMessagesConfig
         * @public
         * @returns {Promise.<Array>} the message objects
         * @memberof app/mgr/AppConfigManager#
         */
        getMessagesConfig: function () {
            var appConfig = config.get("app.config");

            if (appConfig === USE_LOCAL_CONFIG) {
                return promise.resolve(localAppConfig.messages);
            }

            return this.__getAllAppConfigs().then(util.bind(function (data) {
                return data.messages || [];
            }, this));
        },

        __getMenuMetadataByMenuId: function (menuId) {
            return this.getSitemap().then(function (data) {
                var menus = data.config_menus;

                for (var i = 0, l = menus.length; i < l; i++) {
                    if (menus[i].id === menuId) {
                        return menus[i];
                    }
                }
            });
        },

        __getAllAppConfigs: function () {
            if (this.__getAllAppConfigsPromise) {
                return this.__getAllAppConfigsPromise;
            }

            var configurationService = ServiceHolder.singleton().getConfigurationService();

            if (!configurationService) {
                return promise.resolve({});
            }

            this.__getAllAppConfigsPromise = configurationService
                .getAllConfigs()
                .complete(util.bind(function () {
                    this.__getAllAppConfigsPromise = null;
                }, this));

            return this.__getAllAppConfigsPromise;
        },

        /**
         * Init the localization module.
         * @method initI18n
         * @public
         * @returns {Promise.<Undefined>} fulfilled with no return value
         * @memberof app/mgr/AppConfigManager#
         */
        initI18n: function () {
            //you need to include "vdk-lib-i18next/i18next" package
            if (typeof i18next === "undefined") {
                console.warn(
                    "No i18n package found in AppConfigManager, " +
                    "you can install localization package vdk-lib-i18next if necessary"
                );
                return promise.reject();
            }

            if (this.__initI18nPromise) {
                return this.__initI18nPromise;
            }

            this.__initI18nPromise = promise.promise(util.bind(function (resolver, rejecter) {
                /* jshint ignore:start */
                i18next.init({}, util.bind(function (err) {
                    if (err) {
                        rejecter("failed to init i18next:" + err);
                        return;
                    }

                    this.__i18n = i18next;

                    //when using local file to implement the i18n,
                    //you may need to change the init options or preprocessing and
                    //add local files according to i18next requirements.
                    //more details please check Accedo wiki and i18next documents
                    if (config.get("app.config") === USE_LOCAL_CONFIG) {
                        this.__initI18nPromise = null;
                        resolver();
                        return;
                    }

                    //start to use AppGrid CMS to add resources
                    this.getCurrentDictionaryId()
                        .then(util.bind(function (id) {
                            return this.addResourcesByDictionaryId(id)
                                .then(util.bind(this.changeLanguageByDictionaryId, this, id));
                        }, this))
                        .then(resolver)
                        .fail(util.bind(rejecter, this))
                        .complete(util.bind(function () {
                            this.__initI18nPromise = null;
                        }, this));

                }, this));
                /* jshint ignore:end */
            }, this));

            return this.__initI18nPromise;
        },

        /**
         * Translate by given string
         * @method translate
         * @public
         * @param {String} string the string to be translated
         * @returns {String} the translated result
         * @memberof app/mgr/AppConfigManager#
         */
        translate: function (string) {
            if (this.__i18n) {
                return this.__i18n.t(string);
            }

            throw new VIAError(VIAError.FACILITY.CONFIGURATION_SERVICE, VIAError.ERROR.INVALID, "i18n is not initialized.");
        },

        /**
         * Translate by given string (Syntax sugar for translate)
         * @method t
         * @public
         * @param {String} string the string to be translated
         * @returns {String} the translated result
         * @memberof app/mgr/AppConfigManager#
         */
        t: function (string) {
            return this.translate(string);
        },

        /**
         * Translate by given string (Syntax sugar for translate)
         * @method addResourcesByDictionaryId
         * @public
         * @param {String} id the id of dictionary entry on CMS
         * @returns {Promise.<Undefined>} fulfilled with no return value
         * @memberof app/mgr/AppConfigManager#
         */
        addResourcesByDictionaryId: function (id) {
            return this.__getDictionaryById(id).then(util.bind(function (dictionary) {
                return this.__getCMSTranslationsByDictionary(dictionary).then(util.bind(function (translations) {
                    this.__addCMSTranslationsToResources(dictionary.title, translations);
                }, this));
            }, this));
        },

        /**
         * Change the language of localization module.
         * You may need to add the resources to the target language before the change.
         * @method changeLanguageByDictionaryId
         * @public
         * @param {String} id the id of dictionary entry on CMS
         * @returns {Promise.<Undefined>} fulfilled with no return value
         * @memberof app/mgr/AppConfigManager#
         */
        changeLanguageByDictionaryId: function (id) {
            return promise.promise(util.bind(function (resolver, rejecter) {
                this.__getDictionaryById(id).then(util.bind(function (dictionary) {
                    this.__i18n.changeLanguage(dictionary.title, function (err) {
                        if (err) {
                            rejecter("failed to change language:" + err);
                            return;
                        }

                        resolver();
                    });
                }, this), util.bind(rejecter, this, "failed to add resources to i18n")).done();
            }, this));
        },

        __getDictionaryById: function (id) {
            var configurationService = ServiceHolder.singleton().getConfigurationService(),
                dictionaryTypeId = config.get("appgrid").CMS.type.Dictionary;

            return configurationService.getEntriesByEntryTypeId(dictionaryTypeId)
                .then(util.bind(function (data) {
                    for (var i = 0, l = data.entries.length; i < l; i++) {
                        if (data.entries[i]._meta.id === id) {
                            return data.entries[i];
                        }
                    }
                }, this));
        },

        /**
         * Get the current dictionary id, if it's never been set, will fetch the default one.
         * @method getCurrentDictionaryId
         * @public
         * @returns {String} the id of the current dictionary entry on CMS
         * @memberof app/mgr/AppConfigManager#
         */
        getCurrentDictionaryId: function () {
            //you can set the default id as an AppGrid metadata when you need to configure it dynamically
            if (!this.__currentDictionaryId) {
                this.__currentDictionaryId = config.get("appgrid").CMS.defaultDictionaryId;
            }

            return promise.resolve(this.__currentDictionaryId);
        },

        __getCMSTranslationsByDictionary: function (data) {
            var configurationService = ServiceHolder.singleton().getConfigurationService(),
                translationIds = [],
                translationAttributes = config.get("appgrid").CMS.dictionaryTranslations;

            for (var i in data) {
                if (data.hasOwnProperty(i)) {
                    if (translationAttributes.indexOf(i) > -1) {
                        translationIds.push(data[i]);
                    }
                }
            }

            return configurationService.getEntriesByIds(translationIds).then(function (data) {
                return data.entries;
            });
        },

        __addCMSTranslationsToResources: function (language, translations) {
            //default attributes should be removed coz they are not related to the translation dictionary.
            var defaultAttributes = [
                    "_meta",
                    "id",
                    "publishedFrom",
                    "title",
                    "typeAlias",
                    "typeId"
                ],
                translation,
                namespace;

            for (var i = 0, l = translations.length; i < l; i++) {
                translation = translations[i];
                namespace = translation._meta.attrs.namespace;

                for (var ii in translation) {
                    if (translation.hasOwnProperty(ii) && defaultAttributes.indexOf(ii) > -1) {
                        delete translation[ii];
                    }
                }

                this.__i18n.addResources(language, namespace, translation);
            }
        }
    });

    return AppConfigManager;
});