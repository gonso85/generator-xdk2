/**
 * The image button widget for main menu
 * @name MainMenuButton
 * @memberof app/wgt
 * @class app/wgt/MainMenuButton
 * @param {Object} opts The options object
 * @param {String} opts.icon the button icon image link
 * @param {String|xdk-ax/mvc/ModelRef} opts.text The text displayed on this button
 * @param {String} [opts.isPureText] whether the button text to set is pure text or html
 */
define("app/wgt/MainMenuButton", [
    "xdk-ax/Container",
    "xdk-ax/evt/type",
    "xdk-ax/focusManager",
    "xdk-base/class",
    "xdk-base/console",
    "xdk-base/device",
    "xdk-base/Element",
    "xdk-base/util",
    "xdk-ui-basic/Image",
    "xdk-ui-basic/Label"
], function (
    Container,
    evtType,
    fm,
    klass,
    console,
    device,
    Element,
    util,
    Img,
    Label
) {

    return klass.create(Container, {}, {
        /**
         * The internal label widget to show button text
         * @protected
         * @name _label
         * @memberof app/wgt/MainMenuButton#
         */
        _label: null,
        /**
         * The internal image widget to show button icon
         * @protected
         * @name _icon
         * @memberof app/wgt/MainMenuButton#
         */
        _icon: null,
        /**
         * The internal image widget to show button icon, when selected
         * @protected
         * @name _selectedIcon
         * @memberof app/wgt/MainMenuButton#
         */
        _selectedIcon: null,

        _isSelected: false,
        /**
         * override parent"s init() method
         * @method
         * @memberof app/wgt/MainMenuButton#
         * @protected
         */
        init: function (opts) {
            opts.focusable = true;
            opts.clickable = true;
            opts.root = opts.root || new Element("div");

            this._super(opts);

            this.getRoot().addClass("main-menu-button");
            this.getRoot().addClass("menu-button");

            if (opts.icon) {
                this._icon = new Container({
                    css: "icon",
                    src: opts.icon,
                    parent: this
                });
                this._icon.getRoot().getHTMLElement().style.webkitMaskImage = "url(" + opts.icon + ")";
            }

            if (opts.text) {
                this._label = new Label({
                    text: opts.text,
                    isPureText: opts.isPureText || false,
                    parent: this
                });
            }
        },

        select: function () {
            console.info("select");
            this.addClass("selected");
            this._isSelected = true;
        },

        unselect: function () {
            console.info("unselect");
            this.removeClass("selected");
            this._isSelected = false;
        }

    });
});