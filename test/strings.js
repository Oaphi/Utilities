const { expect } = require("chai");

const { isLcase, isUcase } = require("../src/strings.js");

describe('isLcase', function () {
    
    it('should be false if empty string', function () {
        const check = isLcase("");
        expect(check).to.be.false;
    });

    it('should be false if at least one uppercase char', function () {
        const check = isLcase("desolate Places");
        expect(check).to.be.false;
    });

    it('should be true if all lowercase', function () {
        const check = isLcase("this is truly low");
        expect(check).to.be.true;
    });

});

describe('isUcase', function () {

    it('should be false if empty string', function () {
        const check = isUcase("");
        expect(check).to.be.false;
    });

    it('should be false if at least one lowercase char', function () {
        const check = isUcase("desolate Places");
        expect(check).to.be.false;
    });

    it('should be true if all uppercase', function () {
        const check = isUcase("DO NOT SHOUT AT ME");
        expect(check).to.be.true;
    });

});