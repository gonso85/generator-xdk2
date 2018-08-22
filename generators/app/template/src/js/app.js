require(["ax/sEnv",
    "ax/af/mvc/sAppRoot",
    "demo/ctrl/Main",
    "ax/console"
], function (sEnv, sAppRoot, MainCtrl, console) {
    "use strict";

    sEnv.addEventListener(sEnv.EVT_ONLOAD, function () {
        console.log("All module loaded!");
        sAppRoot.setMainController(MainCtrl);
    });
});
