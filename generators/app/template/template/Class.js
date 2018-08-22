/**
 * {CLASS_NAME}
 *
 * @class {CLASS_PATH}
 * @author xxx <xxx@accedo.tv>
 */
define("{CLASS_PATH}", [
    "xdk-base/class"{EXTENDED_CLASS_COMMA}
    {EXTENDED_CLASS_PATH}
], function (
    klass{EXTENDED_CLASS_COMMA}
    {EXTENDED_CLASS_NAME}
) {
    return klass.create({EXTENDED_CLASS_NAME}{EXTENDED_CLASS_COMMA}{EXTENDED_CLASS_SPACE}{}, {
        /**
         * override parent's init() method
         * @method
         * @memberof {CLASS_PATH}
         * @protected
         */
        init: function (opts) {
            {EXTENDED_CLASS_SUPER_FUNC}
        }
    });
});