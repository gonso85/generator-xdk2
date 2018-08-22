describe("app/mgr/UserManager", function () {
    "use strict";

    var expect = chai.expect,
        sUserManager;

    before(function (done) {
        require(["app/mgr/UserManager"], function () {
            sUserManager = arguments[0].singleton();
            done();
        });
    });

    describe("getUserState", function () {
        it("should return a string", function () {
            expect(sUserManager.getUserState()).to.be.a("string");
        });
    });
});
