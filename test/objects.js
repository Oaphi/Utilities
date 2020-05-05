const { expect } = require('chai');

const { isObject, smartGetter } = require('../src/objects.js');

describe('isObject', function () {
    
    it('should return false on undefined', function () {
        const undef = isObject();
        expect(undef).to.be.false;
    });

    it('should return false on null', function () {
        const nulled = isObject(null);
        expect(nulled).to.be.false
    });

    it('should return false for arrays', function () {
        const arr = isObject([1,2,3]);
        expect(arr).to.be.false;
    });

    it('should return true on empty obj', function () {
        const obj = isObject({});
        expect(obj).to.be.true;
    });

    it('should return true on non-empty obj', function () {
        const obj = isObject({ keys: "values" });
        expect(obj).to.be.true;
    });

});

describe('smartGetter', function () {
    
    it('should define getter on context', function () {
        const obj = {};
        smartGetter(obj,"alpha", () => "beta");
        expect(obj).to.haveOwnProperty("alpha");
    });

    it('should memoize value', function () {
        const obj = { count: 1 };
        smartGetter(obj, "viconts", (o) => {
            return o.count * 2;
        });
        expect(obj.viconts).to.equal(2);

        obj.count = 4;

        expect(obj.viconts).to.equal(2);
    });

});