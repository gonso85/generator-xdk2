define("app/template/main/mainView", [
    "xdk-ax/Container",
    "xdk-ui-grid/Grid",
    "xdk-ui-basic/Layout",
    "app/wgt/MenuList",
    "app/wgt/SubmenuList"
], function (
    Container,
    Grid,
    Layout,
    MenuList,
    SubmenuList
) {
    return function (SubCtrl) {

        return {
            klass: Layout,
            alignment: Layout.VERTICAL,
            id: "#mainView",
            children: [{
                klass: Container,
                id: "header",
                forwardFocus: true,
                nextDown: "subCtrlContainer",
                children: [{
                    klass: Container,
                    id: "#logo"
                }, {
                    klass: MenuList,
                    id: "#mainMenu",
                    rows: 9,
                    cols: 1,
                    alignment: Grid.VERTICAL,
                    nextDown: "submenu"
                }, {
                    klass: SubmenuList,
                    id: "#submenu",
                    rows: 9,
                    cols: 1,
                    alignment: Grid.VERTICAL,
                    nextUp: "mainMenu"
                }]
            }, {
                klass: Container,
                id: "#subCtrlContainer",
                forwardFocus: true,
                nextUp: "header",
                children: [{
                    controller: SubCtrl
                }]
            }]
        };
    };

});