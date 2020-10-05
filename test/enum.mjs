import { defineConstant, makeEnum } from '../src/enum.mjs';

import chai from "chai";
const { expect } = chai;

describe('defineConstant should define', function () {

    const testObj = {};

    defineConstant(testObj, "testKey", 42);

    const keys = Object.keys(testObj);

    it('with ascribed value', function () {
        expect(testObj.testKey).to.equal(42);
    });

    it('enumerable property (default)', function () {
        const hasKey = keys.includes("testKey");
        expect(hasKey).to.be.true;
    });

    it('non-enumerable optionally', function () {
        defineConstant(testObj, "nonEnum", "skip me", false);
        const hasKey = Object.keys(testObj).includes("nonEnum");
        expect(hasKey).to.be.false;
    });

    it('non-configurable property', function () {
        const tryDelete = () => delete testObj.testKey;
        expect(tryDelete).to.throw(TypeError);
    });

    it('non-writable property', function () {
        const tryAssign = () => testObj.testKey = "no-no";
        expect(tryAssign).to.throw(TypeError);
    });

});

describe('makeEnum', function () {

    it('should not inherit from Object', function () {

        const traps = makeEnum(["preventExtensions", "getOwnPropertyDescriptor"]);

        expect(traps instanceof Object).to.be.false;
        expect(Object.getPrototypeOf(traps)).to.be.null;
    });

    it('toString() should return [object Enum]', function () {

        const proxyStructure = makeEnum(["handler", "traps", "target"]);

        expect(proxyStructure.toString).to.not.be.undefined;
        expect(proxyStructure.toString()).to.equal("[object Enum]");
    });

    it('should assign powers of 2 to values', function () {

        const someTraps = makeEnum(["ownKeys", "construct", "defineProperty"]);

        expect(someTraps.ownKeys).to.equal(1);
        expect(someTraps.construct).to.equal(2);
        expect(someTraps.defineProperty).to.equal(4);
    });

    it.skip('should maintain order of insertion', function () {
        const values = ["getPrototypeOf", "setPrototypeOf", "isExtensible"];
        const moreTraps = makeEnum(values);
        expect(moreTraps).to.deep.equal(values);
    });

    it('should have immutable "length"', function () {
        const values = ["configurable", "writable", "enumerable", "value", "get", "set"];
        const descriptors = makeEnum(values);

        expect(descriptors.length).to.equal(6);

        const tryAssign = () => descriptors.length = 20;
        const tryDelete = () => delete descriptors.length;

        expect(tryAssign).to.throw(TypeError);
        expect(tryDelete).to.throw(TypeError);
    });

    it('should throw RangeError on invalid access', function () {
        const values = ["apply", "get", "set", "has", "deleteProperty"];
        const evenMoreTraps = makeEnum(values);

        const fails = () => evenMoreTraps["nonesense"];

        expect(fails).to.throw(RangeError);
    });
    
    it('should support bracket access', function () {
        const values = ["GITS", "GITS: SAC", "GITS: Awaken"];
        const entries = makeEnum(values);

        expect( entries["GITS"] ).to.not.be.undefined;
    });

    it('should support for...in', function () {
        const values = ["toPrimitive", "toStringTag"];

        const symbols = makeEnum(values);

        for (const key in symbols) {
            expect(values.includes(key)).to.be.true;
        }

    });

    it('should support for...of', function () {
        const values = ["iterator", "asyncIterator", "match", "matchAll"];
        const symbols = makeEnum(values);

        const fromForOf = [];
        for (const key of symbols) {
            fromForOf.push(key);
        }

        expect(fromForOf).to.deep.equal(values);
    });

    it('should correctly behave with Object methods', function () {
        const inits = ["for", "keyFor"];
        const symbolMethods = makeEnum(inits);

        const keys = Object.keys(symbolMethods);
        const values = Object.values(symbolMethods);
        const entries = Object.entries(symbolMethods);

        expect(keys).to.deep.equal(inits);
        expect(values).to.deep.equal([1,2]);
        expect(entries).to.deep.equal([["for",1],["keyFor",2]]);
    });

    it('values should be comparable', function () {
        const values = ["replace", "search", "split", "hasInstance"];
        const moreSymbols = makeEnum(values);

        const testValue = moreSymbols.hasInstance;

        expect(moreSymbols.replace === moreSymbols.replace).to.be.true;
        expect(moreSymbols.search !== moreSymbols.split).to.be.true;
        expect(moreSymbols.hasInstance === testValue).to.be.true;
    });

    it('values should survive serialization', function () {
        const values = ["isConcatSpreadable", "species", "unscopables"];
        const evenMoreSymbols = makeEnum(values);

        const serialized = JSON.parse(JSON.stringify(evenMoreSymbols.species));

        expect(evenMoreSymbols.species === serialized).to.be.true;
    });

});